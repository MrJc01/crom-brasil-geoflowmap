import { useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { Camera } from 'lucide-react';
import { CromGeoMap } from './lib';
import { Sidebar } from './components/Sidebar';
import { ItemEditor } from './components/ItemEditor';
import { JsonEditor } from './components/JsonEditor';
import { DetailsPanel } from './components/DetailsPanel';
import { ScreenshotPreview } from './components/ScreenshotPreview';
import type { ProjectNode, ItemType } from './lib/types';
import { LAYERS_CONFIG } from './data/layersConfig';
import './App.css';

// --- MOCK INITIAL DATA ---
const MOCK_TREE: ProjectNode[] = [
  {
    id: 'group-exports',
    name: 'Exportações',
    type: 'group',
    visible: true,
    children: LAYERS_CONFIG.filter(l => l.type === 'Arc').map(l => ({
      id: l.id,
      name: l.name,
      type: 'item',
      itemType: 'Arc',
      visible: l.visible,
      color: l.color,
      data: l.data[0],
      info: l.info
    }))
  },
  {
    id: 'group-infra',
    name: 'Infraestrutura',
    type: 'group',
    visible: true,
    children: LAYERS_CONFIG.filter(l => l.type !== 'Arc').map(l => ({
      id: l.id,
      name: l.name,
      type: 'item',
      itemType: l.type as ItemType,
      visible: l.visible,
      color: l.color,
      data: Array.isArray(l.data) ? l.data[0] : l.data,
      info: l.info
    }))
  }
];

// --- HELPER FUNCTIONS ---
const updateNodeInTree = (nodes: ProjectNode[], id: string, updates: Partial<ProjectNode>): ProjectNode[] => {
  return nodes.map(node => {
    if (node.id === id) return { ...node, ...updates };
    if (node.children) return { ...node, children: updateNodeInTree(node.children, id, updates) };
    return node;
  });
};

const deleteNodeInTree = (nodes: ProjectNode[], id: string): ProjectNode[] => {
  return nodes.filter(node => node.id !== id).map(node => {
    if (node.children) return { ...node, children: deleteNodeInTree(node.children, id) };
    return node;
  });
};

const insertNodeIntoTree = (nodes: ProjectNode[], parentId: string, newNode: ProjectNode): ProjectNode[] => {
  return nodes.map(node => {
    if (node.id === parentId && node.type === 'group') {
      return { ...node, children: [...(node.children || []), newNode] };
    }
    if (node.children) {
      return { ...node, children: insertNodeIntoTree(node.children, parentId, newNode) };
    }
    return node;
  });
};

const duplicateNodeRecursively = (nodes: ProjectNode[], nodeId: string): ProjectNode[] => {
  const topLevelIndex = nodes.findIndex(n => n.id === nodeId);
  if (topLevelIndex !== -1) {
    const original = nodes[topLevelIndex];
    const copy = JSON.parse(JSON.stringify(original));
    copy.id = `${original.id}-copy-${Date.now()}`;
    copy.name = `${original.name} (Cópia)`;
    const newNodes = [...nodes];
    newNodes.splice(topLevelIndex + 1, 0, copy);
    return newNodes;
  }
  return nodes.map(node => {
    if (node.children) {
      const childIndex = node.children.findIndex(c => c.id === nodeId);
      if (childIndex !== -1) {
        const original = node.children[childIndex];
        const copy = JSON.parse(JSON.stringify(original));
        copy.id = `${original.id}-copy-${Date.now()}`;
        copy.name = `${original.name} (Cópia)`;
        const newChildren = [...node.children];
        newChildren.splice(childIndex + 1, 0, copy);
        return { ...node, children: newChildren };
      }
      return { ...node, children: duplicateNodeRecursively(node.children, nodeId) };
    }
    return node;
  });
};

const findNode = (nodes: ProjectNode[], id: string): ProjectNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// STATE
function App() {
  const [projectTree, setProjectTree] = useState<ProjectNode[]>(MOCK_TREE);
  const [isJsonEditorOpen, setJsonEditorOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [viewingNodeId, setViewingNodeId] = useState<string | null>(null);

  // Screenshot State
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // HANDLERS
  const handleToggleVisibility = (id: string, visible: boolean) => {
    setProjectTree(prev => updateNodeInTree(prev, id, { visible }));
  };

  const handleDeleteNode = (node: ProjectNode) => {
    if (confirm(`Excluir ${node.name}?`)) {
      setProjectTree(prev => deleteNodeInTree(prev, node.id));
    }
  };

  const handleDuplicateNode = (node: ProjectNode) => {
    setProjectTree(prev => duplicateNodeRecursively(prev, node.id));
  };

  const handleAddGroupToRoot = () => {
    const newGroup: ProjectNode = {
      id: `group-${Date.now()}`,
      name: 'Nova Pasta',
      type: 'group',
      visible: true,
      children: []
    };
    setProjectTree(prev => [...prev, newGroup]);
  };

  const handleAddNodeToGroup = (parentId: string, type: 'group' | 'item', itemType?: ItemType) => {
    const id = `${type}-${Date.now()}`;
    const newNode: ProjectNode = {
      id,
      name: type === 'group' ? 'Nova Pasta' : `Novo Item (${itemType})`,
      type: type,
      itemType: itemType,
      visible: true,
      children: [],
      data: itemType === 'Line' || itemType === 'Arc' ?
        { source: [-55, -12], target: [-43, -22] } :
        { coordinates: [-55, -12] }
    };
    setProjectTree(prev => insertNodeIntoTree(prev, parentId, newNode));

    // Auto-edit
    if (type === 'item') {
      setTimeout(() => setEditingNodeId(id), 100);
    }
  };

  const handleSaveEditor = (formData: any) => {
    if (!editingNodeId) return;
    // Destructuring carefully to separate Node properties from Data properties
    const { name, color, info, itemType, value, width, shape, size, ...itemData } = formData;
    setProjectTree(prev => updateNodeInTree(prev, editingNodeId, {
      name, color, info, itemType, value, width, shape, size, data: itemData
    }));
    setEditingNodeId(null);
  };

  // --- SCREENSHOT HANDLER ---
  const handleScreenshot = async () => {
    setIsCapturing(true);
    // Wait for state to propagate and UI to hide
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(document.body, {
          allowTaint: true,
          useCORS: true,
          backgroundColor: '#020617', // Match slate-950
          ignoreElements: (element) => {
            // Extra insurance to ignore elements if needed, 
            // though React state hiding is cleaner
            return element.classList && element.classList.contains('no-print');
          }
        });

        const image = canvas.toDataURL("image/png");
        setPreviewImage(image);
      } catch (err) {
        console.error("Screenshot failed:", err);
        alert("Falha ao capturar a tela. Verifique o console.");
      } finally {
        setIsCapturing(false);
      }
    }, 300); // 300ms delay
  };

  const handleDownloadScreenshot = () => {
    if (!previewImage) return;
    const link = document.createElement('a');
    link.href = previewImage;
    link.download = `flowmap-screenshot-${new Date().toISOString().slice(0, 19)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setPreviewImage(null);
  };

  // Editor Data Preparation
  const editingNode = editingNodeId ? findNode(projectTree, editingNodeId) : null;

  // Memoize to prevent spurious resets in Editor
  const editorData = useMemo(() => editingNode ? {
    name: editingNode.name,
    color: editingNode.color,
    info: editingNode.info,
    itemType: editingNode.itemType,
    value: editingNode.value,
    width: editingNode.width,
    shape: editingNode.shape,
    size: editingNode.size,
    ...editingNode.data
  } : null, [editingNode]);

  const viewingNode = viewingNodeId ? findNode(projectTree, viewingNodeId) : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* MAP LAYOUT (Z-0) */}
      <div className="absolute inset-0 z-0">
        <CromGeoMap
          nodes={projectTree}
          onNodeClick={(n) => !isCapturing && setViewingNodeId(n.id)}
          onEditNode={(n) => !isCapturing && setEditingNodeId(n.id)}
        />
      </div>

      {/* UI OVERLAY (Z-10+) - HIDDEN DURING CAPTURE */}
      {!isCapturing && (
        <>
          <Sidebar
            nodes={projectTree}
            onToggleVisibility={handleToggleVisibility}
            onEditJson={() => setJsonEditorOpen(true)}
            onEditNode={(n) => setEditingNodeId(n.id)}
            onViewNode={(n) => setViewingNodeId(n.id)} // Open InfoModal
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
            onAddGroup={handleAddGroupToRoot}
            onAddNode={handleAddNodeToGroup}
          />

          {/* SCREENSHOT BUTTON */}
          <div className="fixed bottom-6 right-6 z-40 tooltip-container">
            <button
              onClick={handleScreenshot}
              className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-2xl border border-white/10 transition-all hover:scale-105 active:scale-95 group"
              title="Capturar Tela"
            >
              <Camera size={24} className="group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
        </>
      )}

      {/* EDITORS & MODALS - HIDDEN DURING CAPTURE */}
      {!isCapturing && (
        <>
          <DetailsPanel
            isOpen={!!viewingNodeId}
            node={viewingNode}
            onClose={() => setViewingNodeId(null)}
            onEdit={(n) => { setViewingNodeId(null); setEditingNodeId(n.id); }}
          />

          <JsonEditor
            isOpen={isJsonEditorOpen}
            initialData={projectTree}
            onSave={(newData) => setProjectTree(newData)}
            onClose={() => setJsonEditorOpen(false)}
          />

          {editingNode && editorData && (
            <ItemEditor
              nodeId={editingNode.id}
              data={editorData}
              layerType={editingNode.type}
              itemType={editingNode.itemType}
              onSave={handleSaveEditor}
              onClose={() => setEditingNodeId(null)}
            />
          )}
        </>
      )}

      {/* PREVIEW MODAL */}
      {previewImage && (
        <ScreenshotPreview
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
          onDownload={handleDownloadScreenshot}
        />
      )}

    </div>
  );
}

export default App;
