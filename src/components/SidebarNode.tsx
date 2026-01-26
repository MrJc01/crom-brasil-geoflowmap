import React, { useState } from 'react';
import type { ProjectNode } from '../types/ProjectTypes';
import { ChevronRight, ChevronDown, Folder, Eye, EyeOff, Info, Edit3 } from 'lucide-react';

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

    const toggleVisibility = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleVisibility(node.id, !node.visible);
    };

    // Styling based on depth
    const paddingLeft = `${depth * 12 + 12}px`;

    // --- PASTA / GRUPO ---
    if (node.type === 'group') {
        return (
            <div className="select-none">
                <div
                    className="flex items-center py-1.5 px-2 hover:bg-white/5 cursor-pointer text-slate-300 transition-colors group"
                    style={{ paddingLeft }}
                    onContextMenu={(e) => onContextMenu(e, node)}
                    onClick={handleToggle}
                >
                    <span className="mr-1.5 text-slate-500 hover:text-white transition-colors">
                        {isExpanded ? <ChevronDown size={14} className="pointer-events-none" /> : <ChevronRight size={14} className="pointer-events-none" />}
                    </span>

                    <span className="mr-2 text-yellow-500/80">
                        <Folder size={14} fill="currentColor" fillOpacity={0.2} className="pointer-events-none" />
                    </span>

                    <span className="text-sm font-medium truncate flex-1 tracking-wide">
                        {node.name}
                    </span>

                    {/* Actions Panel (Visible on Group Hover) */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <button
                            onClick={toggleVisibility}
                            className="text-slate-500 hover:text-white p-0.5 rounded cursor-pointer z-10"
                            title={node.visible ? "Ocultar" : "Mostrar"}
                        >
                            {node.visible ? <Eye size={13} className="pointer-events-none" /> : <EyeOff size={13} className="pointer-events-none" />}
                        </button>
                    </div>
                </div>

                {isExpanded && node.children && (
                    <div className="border-l border-white/5 ml-[22px]">
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

    // --- ITEM / CAMADA ---
    const colorStyle = node.color ? `rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})` : '#94a3b8';

    return (
        <div
            className="flex items-center py-1.5 px-2 hover:bg-white/5 cursor-pointer group text-slate-400 border-b border-transparent hover:border-white/5 transition-all"
            style={{ paddingLeft }}
            onContextMenu={(e) => onContextMenu(e, node)}
            onClick={() => onEditNode(node)}
        >
            {/* Color Indicator */}
            <div
                className="w-2 h-2 rounded-full mr-3 shadow-[0_0_8px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                style={{ backgroundColor: colorStyle, boxShadow: `0 0 6px ${colorStyle}` }}
            ></div>

            <span className="text-sm truncate flex-1 font-light group-hover:text-white transition-colors">
                {node.name}
            </span>

            {/* Actions Panel */}
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                    onClick={(e) => { e.stopPropagation(); onViewNode(node); }}
                    className="text-slate-600 hover:text-blue-400 p-1 rounded hover:bg-white/5"
                    title="Informações"
                >
                    <Info size={12} className="pointer-events-none" />
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onEditNode(node); }}
                    className="text-slate-600 hover:text-emerald-400 p-1 rounded hover:bg-white/5"
                    title="Editar"
                >
                    <Edit3 size={12} className="pointer-events-none" />
                </button>

                <button
                    onClick={toggleVisibility}
                    className={`p-1 rounded hover:bg-white/5 ${node.visible ? 'text-slate-500 hover:text-white' : 'text-slate-600'}`}
                    title={node.visible ? "Ocultar" : "Mostrar"}
                >
                    {node.visible ? <Eye size={12} className="pointer-events-none" /> : <EyeOff size={12} className="pointer-events-none" />}
                </button>
            </div>
        </div>
    );
};
