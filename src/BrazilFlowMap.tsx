
import { useMemo, useState } from 'react';
import Map, { useControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ArcLayer, ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

// New Config and Types
import type { ProjectNode, ItemType } from './types/ProjectTypes';
import { Sidebar } from './components/Sidebar';
import { Tooltip } from './components/Tooltip';
import type { TooltipInfo } from './components/Tooltip';
import { JsonEditor } from './components/JsonEditor';
import { ItemEditor } from './components/ItemEditor';
import { InfoPopup } from './components/InfoPopup';
import { LAYERS_CONFIG } from './data/layersConfig'; // Will use as initial seed only, or need migration

const INITIAL_VIEW_STATE = {
    longitude: -55,
    latitude: -15,
    zoom: 3.5,
    pitch: 45,
    bearing: 0
};

function DeckGLOverlay(props: { layers: any[] }) {
    const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
    overlay.setProps(props);
    return null;
}

// Convert legacy flat config to Tree for initial state
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
            data: l.data[0], // Simplified: 1 item per node for this explorer view
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

export function BrazilFlowMap() {
    // ---- STATE ----
    const [projectTree, setProjectTree] = useState<ProjectNode[]>(MOCK_TREE);

    // Interactions
    const [hoverInfo, setHoverInfo] = useState<TooltipInfo | null>(null);
    const [cursor, setCursor] = useState<string>('default');

    // Popups & Editors
    const [popupState, setPopupState] = useState<{ isOpen: boolean; content?: string; title?: string; position?: { x: number, y: number } }>({ isOpen: false });
    const [isJsonEditorOpen, setJsonEditorOpen] = useState(false);

    // The Editor now targets a Node reference
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

    // ---- HELPERS: RECURSIVE OPERATIONS ----

    // Traverse tree to find a node
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

    // Update a node immutably
    const updateNodeInTree = (nodes: ProjectNode[], id: string, updates: Partial<ProjectNode>): ProjectNode[] => {
        return nodes.map(node => {
            if (node.id === id) {
                return { ...node, ...updates };
            }
            if (node.children) {
                return { ...node, children: updateNodeInTree(node.children, id, updates) };
            }
            return node;
        });
    };

    // Delete a node
    const deleteNodeInTree = (nodes: ProjectNode[], id: string): ProjectNode[] => {
        return nodes.filter(node => node.id !== id).map(node => {
            if (node.children) {
                return { ...node, children: deleteNodeInTree(node.children, id) };
            }
            return node;
        });
    };

    // Flatten tree to DeckGL Layers
    const getFlattenedLayers = (nodes: ProjectNode[]): any[] => {
        let layers: any[] = [];

        nodes.forEach(node => {
            if (!node.visible) return;

            if (node.type === 'group' && node.children) {
                layers = [...layers, ...getFlattenedLayers(node.children)];
            } else if (node.type === 'item') {
                // Create a DeckLayer for this single item
                // Note: We wrap node.data in an array because DeckGL expects arrays usually
                // Or we pass single object if we handle accessors correctly.
                // For consistency with previous code, let's assume data is the object properties.

                const layerData = [node.data];

                const commonProps = {
                    id: node.id,
                    data: layerData,
                    pickable: true,
                    onHover: (info: any) => {
                        if (info.object && !popupState.isOpen && !editingNodeId) {
                            setHoverInfo({ object: info.object, x: info.x, y: info.y });
                            setCursor('pointer');
                        } else {
                            setHoverInfo(null);
                            setCursor('default');
                        }
                    },
                    onClick: (info: any) => {
                        if (info.object) {
                            setPopupState({
                                isOpen: true,
                                title: node.name,
                                content: node.info,
                                position: { x: info.x, y: info.y }
                            });
                        }
                    }
                };

                if (node.itemType === 'Arc') {
                    layers.push(new ArcLayer({
                        ...commonProps,
                        getSourcePosition: (d: any) => d.source,
                        getTargetPosition: (d: any) => d.target,
                        getSourceColor: [0, 0, 0, 0],
                        getTargetColor: node.color || [255, 255, 255],
                        getWidth: 3,
                    }));
                } else if (node.itemType === 'Scatterplot') {
                    layers.push(new ScatterplotLayer({
                        ...commonProps,
                        getPosition: (d: any) => d.coordinates,
                        getFillColor: node.color || [255, 255, 0],
                        getRadius: 30000,
                        opacity: 0.9,
                        stroked: true,
                        getLineColor: [255, 255, 255],
                        getLineWidth: 2000
                    }));
                } else if (node.itemType === 'Line') {
                    layers.push(new PathLayer({
                        ...commonProps,
                        getPath: (d: any) => d.path,
                        getColor: node.color || [0, 255, 255],
                        getWidth: 3000,
                        capRounded: true,
                        jointRounded: true
                    }));
                }
            }
        });

        return layers;
    };

    // ---- RECURSIVE UPDATERS ----

    const insertNodeIntoTree = (nodes: ProjectNode[], parentId: string, newNode: ProjectNode): ProjectNode[] => {
        // If inserting at root (parentId is null or empty string, handled by caller mostly, but let's handle top-level check outside or here)
        // If parentId "root", return [...nodes, newNode]

        return nodes.map(node => {
            if (node.id === parentId) {
                // Determine if we can add children to this node
                if (node.type === 'group') {
                    return { ...node, children: [...(node.children || []), newNode] };
                }
                return node; // Can't add to item, ignore or handle upstream
            }
            if (node.children) {
                return { ...node, children: insertNodeIntoTree(node.children, parentId, newNode) };
            }
            return node;
        });
    };

    const duplicateNodeRecursively = (nodes: ProjectNode[], nodeId: string): ProjectNode[] => {
        // We need to find the node, clone it, and insert it into its parent's children array
        // This is easier if we look for the PARENT of the node we want to duplicate.

        // Strategy: Traverse. If a node has a child with `nodeId`, duplicate that child in the array.
        // Special case: Top level nodes.

        // Check top level first
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
                // Recurse
                return { ...node, children: duplicateNodeRecursively(node.children, nodeId) };
            }
            return node;
        });
    };

    // ---- HANDLERS ----

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

    const handleSaveEditor = (formData: any) => {
        if (!editingNodeId) return;

        // formData contains flat properties like "name", "color", "info" AND "data" props (coordinates etc)
        // We need to separate them.

        const { name, color, info, ...itemData } = formData;

        setProjectTree(prev => updateNodeInTree(prev, editingNodeId, {
            name,
            color,
            info,
            data: itemData // Creating a unified data object for the Deck Layer
        }));

        setEditingNodeId(null);
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
            // Default data
            data: itemType === 'Line' ?
                { path: [[-46, -23], [-43, -22]], name: 'Nova Rota' } :
                itemType === 'Arc' ? { source: [-46, -23], target: [-43, -22], value: 100 } :
                    { coordinates: [-46, -23] }
        };

        setProjectTree(prev => insertNodeIntoTree(prev, parentId, newNode));

        // Auto-edit
        if (type === 'item') {
            setTimeout(() => {
                setEditingNodeId(id);
                setPopupState({ isOpen: false });
            }, 100);
        }
    };

    const handleEditNode = (node: ProjectNode) => {
        setEditingNodeId(node.id);
        setPopupState({ isOpen: false });
    };

    const deckLayers = useMemo(() => getFlattenedLayers(projectTree), [projectTree, popupState.isOpen]);

    // Prepare Editor Data
    const editingNode = editingNodeId ? findNode(projectTree, editingNodeId) : null;
    const editorData = editingNode ? {
        name: editingNode.name,
        color: editingNode.color,
        info: editingNode.info,
        ...editingNode.data
    } : null;

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', cursor }}>
            <Map
                initialViewState={INITIAL_VIEW_STATE}
                mapLib={maplibregl}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                style={{ width: '100%', height: '100%' }}
            >
                <DeckGLOverlay layers={deckLayers} />
            </Map>

            <Sidebar
                nodes={projectTree}
                onToggleVisibility={handleToggleVisibility}
                onEditJson={() => setJsonEditorOpen(true)}
                onEditNode={handleEditNode}
                onViewNode={(n) => setPopupState({ isOpen: true, title: n.name, content: n.info })}
                onDeleteNode={handleDeleteNode}
                onDuplicateNode={handleDuplicateNode}
                onAddGroup={handleAddGroupToRoot}
                onAddNode={handleAddNodeToGroup}
            />

            {!popupState.isOpen && !editingNodeId && <Tooltip info={hoverInfo} />}

            <InfoPopup
                isOpen={popupState.isOpen}
                title={popupState.title}
                content={popupState.content}
                position={popupState.position}
                onClose={() => setPopupState({ isOpen: false })}
                onEdit={() => {
                    // Logic to find node from popup (might need to store ID in popup state)
                }}
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
                    layerType={editingNode.type} // 'group' or 'item'
                    onSave={handleSaveEditor}
                    onClose={() => setEditingNodeId(null)}
                />
            )}
        </div>
    );
}
