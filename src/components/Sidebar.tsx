import React, { useState, useEffect } from 'react';
import type { ProjectNode } from '../lib/types';
import { SidebarNode } from './SidebarNode';
import { Menu, X, FolderPlus, FileJson, Plus, Edit, Copy, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [isOpen, setIsOpen] = useState(true);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: ProjectNode } | null>(null);

    // Responsive auto-close
    useEffect(() => {
        if (window.innerWidth < 768) setIsOpen(false);
    }, []);

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e: React.MouseEvent, node: ProjectNode) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all shadow-lg"
            >
                {isOpen ? <X size={20} className="pointer-events-none" /> : <Menu size={20} className="pointer-events-none" />}
            </button>

            {/* Sidebar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 h-screen w-80 bg-slate-900/90 [backdrop-filter:blur(12px)] border-r border-white/5 z-40 flex flex-col shadow-2xl pt-16"
                    >
                        <div className="px-5 mb-4">
                            <h1 className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase">Explorer</h1>
                        </div>

                        {/* Layer List */}
                        <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
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

                        {/* Footer Controls */}
                        <div className="p-4 border-t border-white/5 bg-black/20 flex flex-col gap-2">
                            <button
                                onClick={onAddGroup}
                                className="flex items-center justify-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-sm transition-all"
                            >
                                <FolderPlus size={16} className="pointer-events-none" />
                                <span>Nova Pasta</span>
                            </button>
                            <button
                                onClick={onEditJson}
                                className="flex items-center justify-center gap-2 p-2 rounded hover:bg-white/5 text-slate-500 text-xs hover:text-slate-300 transition-all border border-transparent hover:border-white/5"
                            >
                                <FileJson size={14} className="pointer-events-none" />
                                <span>Editar JSON</span>
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-[9999] w-48 bg-slate-800 border border-slate-700 shadow-xl rounded-lg py-1 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="px-3 py-1.5 text-xs font-bold text-slate-500 uppercase border-b border-slate-700/50 bg-slate-800/50">
                        {contextMenu.node.type === 'group' ? 'Pasta' : 'Camada'}
                    </div>

                    {contextMenu.node.type === 'group' && (
                        <>
                            <button
                                onClick={() => onAddNode(contextMenu.node.id, 'group')}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-blue-600 hover:text-white transition-colors text-left"
                            >
                                <FolderPlus size={14} className="pointer-events-none" /> Nova Pasta
                            </button>
                            <button
                                onClick={() => onAddNode(contextMenu.node.id, 'item', 'Line')}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-blue-600 hover:text-white transition-colors text-left"
                            >
                                <Plus size={14} className="pointer-events-none" /> Nova Camada
                            </button>
                            <div className="h-px bg-slate-700 my-1 mx-2" />
                        </>
                    )}

                    <button
                        onClick={() => onEditNode(contextMenu.node)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-blue-600 hover:text-white transition-colors text-left"
                    >
                        <Edit size={14} className="pointer-events-none" /> Editar
                    </button>

                    <button
                        onClick={() => onDuplicateNode(contextMenu.node)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-blue-600 hover:text-white transition-colors text-left"
                    >
                        <Copy size={14} className="pointer-events-none" /> Duplicar
                    </button>

                    <div className="h-px bg-slate-700 my-1 mx-2" />

                    <button
                        onClick={() => onDeleteNode(contextMenu.node)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors text-left"
                    >
                        <Trash2 size={14} className="pointer-events-none" /> Excluir
                    </button>
                </div>
            )}
        </>
    );
};
