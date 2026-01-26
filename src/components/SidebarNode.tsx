
import React, { useState } from 'react';
import type { ProjectNode } from '../types/ProjectTypes';
import styles from './Sidebar.module.css';

interface SidebarNodeProps {
    node: ProjectNode;
    depth?: number;
    onToggleVisibility: (id: string, visible: boolean) => void;
    onContextMenu: (e: React.MouseEvent, node: ProjectNode) => void;
    onEditNode: (node: ProjectNode) => void;
    onViewNode: (node: ProjectNode) => void;
}

export const SidebarNode: React.FC<SidebarNodeProps> = ({
    node, depth = 0, onToggleVisibility, onContextMenu, onEditNode, onViewNode
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleCheckboxMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        onToggleVisibility(node.id, e.target.checked);
    };

    // Styling based on depth
    const paddingLeft = `${depth * 12 + 12}px`;

    if (node.type === 'group') {
        return (
            <div className={styles.treeNode}>
                <div
                    className={styles.treeRow}
                    style={{ paddingLeft }}
                    onContextMenu={(e) => onContextMenu(e, node)}
                    onClick={handleToggle}
                >
                    <span
                        style={{
                            marginRight: '6px',
                            fontSize: '0.8rem',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                            display: 'inline-block',
                            width: '12px'
                        }}
                    >
                        ▶
                    </span>
                    <span style={{ marginRight: '6px' }}>📁</span>
                    <span className={styles.nodeLabel} style={{ fontWeight: 'bold', color: '#fff' }}>{node.name}</span>

                    {/* Folder Visibility Toggle */}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                        <label className={styles.miniToggle}>
                            <input
                                type="checkbox"
                                checked={node.visible}
                                onChange={handleCheckboxMessage}
                            />
                            <span className={styles.miniSlider}></span>
                        </label>
                    </div>
                </div>

                {isExpanded && node.children && (
                    <div className={styles.treeChildren}>
                        {node.children.map(child => (
                            <SidebarNode
                                key={child.id}
                                node={child}
                                depth={depth + 1}
                                onToggleVisibility={onToggleVisibility}
                                onContextMenu={onContextMenu}
                                onEditNode={onEditNode}
                                onViewNode={onViewNode}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ITEM RENDER
    const color = node.color ? `rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})` : '#ccc';

    return (
        <div
            className={styles.treeRow}
            style={{ paddingLeft, background: 'transparent' }}
            onContextMenu={(e) => onContextMenu(e, node)}
        >
            <span style={{ width: '12px', marginRight: '6px' }}></span> {/* Spacer for align with folder arrows */}
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, marginRight: '8px', boxShadow: `0 0 5px ${color}` }}></div>

            <span
                className={styles.nodeLabel}
                onClick={() => onEditNode(node)}
                title="Clique para editar"
            >
                {node.name}
            </span>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onViewNode(node); }}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.8rem' }}
                    title="Ver Info"
                >
                    ℹ️
                </button>

                <label className={styles.toggle}>
                    <input
                        type="checkbox"
                        className={styles.toggleInput}
                        checked={node.visible}
                        onChange={handleCheckboxMessage}
                    />
                    <span className={styles.toggleSlider}></span>
                </label>
            </div>
        </div>
    );
};
