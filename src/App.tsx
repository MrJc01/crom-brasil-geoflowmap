import { useState } from 'react';
import { BrazilFlowMap } from './BrazilFlowMap';
import { Sidebar } from './components/Sidebar';
import { ItemEditor } from './components/ItemEditor';
import { JsonEditor } from './components/JsonEditor';
import { InfoModal } from './components/InfoModal';
import type { ProjectNode, ItemType } from './types/ProjectTypes';
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
      name: l.label,
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
      name: l.label,
      type: 'item',
      itemType: (l.type as string) === 'GeoJson' ? 'Line' : l.type as ItemType,
      visible: l.visible,
      color: l.color,
      data: Array.isArray(l.data) ? l.data[0] : l.data,
      info: l.info
    }))
  }
];

// --- HELPER FUNCTIONS ---
// (Moved from BrazilFlowMap)
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
      name: type === 'group' ? 'Nova Pasta' : `Nova Linha (${itemType})`,
      type: type,
      itemType: itemType,
      visible: true,
      children: [],
      data: itemType === 'Line' ?
        { path: [[-46, -23], [-43, -22]], name: 'Nova Rota' } :
        itemType === 'Arc' ? { source: [-46, -23], target: [-43, -22], value: 100 } :
          { coordinates: [-46, -23] }
    };
    setProjectTree(prev => insertNodeIntoTree(prev, parentId, newNode));

    // Auto-edit
    if (type === 'item') {
      setTimeout(() => setEditingNodeId(id), 100);
    }
  };

  const handleSaveEditor = (formData: any) => {
    if (!editingNodeId) return;
    const { name, color, info, itemType, ...itemData } = formData; // Extract itemType
    setProjectTree(prev => updateNodeInTree(prev, editingNodeId, {
      name, color, info, itemType, data: itemData // Update itemType in node
    }));
    setEditingNodeId(null);
  };

  // Editor Data Preparation
  const editingNode = editingNodeId ? findNode(projectTree, editingNodeId) : null;
  const editorData = editingNode ? {
    name: editingNode.name,
    color: editingNode.color,
    info: editingNode.info,
    ...editingNode.data
  } : null;

  const viewingNode = viewingNodeId ? findNode(projectTree, viewingNodeId) : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* MAP LAYOUT (Z-0) */}
      <div className="absolute inset-0 z-0">
        <BrazilFlowMap
          nodes={projectTree}
          onNodeClick={(n) => setViewingNodeId(n.id)}
          onEditNode={(n) => setEditingNodeId(n.id)}
        />
      </div>

      {/* UI OVERLAY (Z-10+) */}
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

      {/* EDITORS & MODALS */}
      <InfoModal
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

      {editingNode && (
        <ItemEditor
          data={editorData}
          layerType={editingNode.type}
          itemType={editingNode.itemType} // Pass current type
          onSave={handleSaveEditor}
          onClose={() => setEditingNodeId(null)}
        />
      )}
    </div>
  );
}

export default App;
