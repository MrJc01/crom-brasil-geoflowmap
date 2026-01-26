
import React, { useState, useEffect } from 'react';
import type { ProjectNode } from '../types/ProjectTypes';
import { SidebarNode } from './SidebarNode';
import styles from './Sidebar.module.css';

interface SidebarProps {
    nodes: ProjectNode[];
    onToggleVisibility: (id: string, visible: boolean) => void;
    onEditJson: () => void;
    onEditNode: (node: ProjectNode) => void;
    onViewNode: (node: ProjectNode) => void;
    onDeleteNode: (node: ProjectNode) => void;
    onDuplicateNode: (node: ProjectNode) => void;
    onAddGroup: () => void;
    onAddNode: (parentId: string, type: 'group' | 'item', itemType?: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    nodes, onToggleVisibility, onEditJson,
    onEditNode, onViewNode, onDeleteNode,
    onDuplicateNode, onAddGroup, onAddNode
}) => {
    const [isOpen, setIsOpen] = useState(() => window.innerWidth > 768);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: ProjectNode } | null>(null);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e: React.MouseEvent, node: ProjectNode) => {
        e.preventDefault();
        e.stopPropagation(); // Stop bubbling to prevent parent context menu
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };

    return (
        <>
            <button
                className={styles.hamburger}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Menu"
            >
                {isOpen ? '✕' : '☰'}
            </button>

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <h1 className={styles.title}>EXPLORER</h1>
                </div>

                <div className={styles.layerList}>
                    {nodes.map(node => (
                        <SidebarNode
                            key={node.id}
                            node={node}
                            onToggleVisibility={onToggleVisibility}
                            onContextMenu={handleContextMenu}
                            onEditNode={onEditNode}
                            onViewNode={onViewNode}
                        />
                    ))}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                        onClick={onAddGroup}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ccc',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        📁 Nova Pasta
                    </button>

                    <button
                        onClick={onEditJson}
                        style={{
                            width: '100%',
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#888',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        ⚙️ JSON
                    </button>
                </div>
            </aside>

            {contextMenu && (
                <div style={{
                    position: 'fixed',
                    top: contextMenu.y,
                    left: contextMenu.x,
                    backgroundColor: '#252526', // VS Code style
                    border: '1px solid #454545',
                    borderRadius: '5px',
                    padding: '4px 0',
                    zIndex: 5000,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    minWidth: '160px',
                    color: '#cccccc',
                    fontSize: '13px'
                }}>
                    <div className="ctx-header" style={{ padding: '6px 12px', color: '#888', fontSize: '11px', textTransform: 'uppercase', borderBottom: '1px solid #333', background: '#252526' }}>
                        {contextMenu.node.type === 'group' ? '📂 Pasta' : '📍 Item'}
                    </div>

                    {contextMenu.node.type === 'group' && (
                        <>
                            <div
                                style={{ padding: '6px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#094771'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                onClick={() => onAddNode(contextMenu.node.id, 'group')}
                            >
                                ➕ Nova Pasta
                            </div>
                            <div
                                style={{ padding: '6px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#094771'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                onClick={() => onAddNode(contextMenu.node.id, 'item', 'Line')}
                            >
                                ➕ Nova Linha
                            </div>
                            <div style={{ height: '1px', background: '#454545', margin: '4px 0' }}></div>
                        </>
                    )}

                    <div
                        style={{ padding: '6px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#094771'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => onEditNode(contextMenu.node)}
                    >
                        ✏️ Editar
                    </div>

                    <div
                        style={{ padding: '6px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#094771'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => onDuplicateNode(contextMenu.node)}
                    >
                        📑 Duplicar
                    </div>

                    <div style={{ height: '1px', background: '#454545', margin: '4px 0' }}></div>

                    <div
                        style={{ padding: '6px 16px', cursor: 'pointer', color: '#ce9178', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#094771'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => onDeleteNode(contextMenu.node)}
                    >
                        🗑️ Excluir
                    </div>
                </div>
            )}
        </>
    );
};
