import React from 'react';
import { X, Edit, Calendar } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectNode } from '../lib/types';

interface DetailsPanelProps {
    node: ProjectNode | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (node: ProjectNode) => void;
}

export const DetailsPanel: React.FC<DetailsPanelProps> = ({ node, isOpen, onClose, onEdit }) => {
    // Determine if we should show the panel
    const show = isOpen && !!node;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 h-screen w-96 bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl pt-0"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_8px_currentColor]"
                                style={{
                                    backgroundColor: node.color ? `rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})` : '#ccc',
                                    color: node.color ? `rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})` : '#ccc'
                                }}
                            />
                            <div className="min-w-0">
                                <h2 className="text-lg font-bold text-white tracking-tight truncate">{node.name}</h2>
                                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono block">
                                    {node.itemType || 'Layer'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => { onEdit(node); }}
                                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit size={16} className="pointer-events-none" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                title="Fechar"
                            >
                                <X size={20} className="pointer-events-none" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {node.info ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <Markdown>{node.info}</Markdown>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-4 opacity-50">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                    <Calendar size={24} className="opacity-50 pointer-events-none" />
                                </div>
                                <p className="text-center text-xs">Nenhuma informação adicional.</p>
                            </div>
                        )}

                        {/* Technical Metadata */}
                        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 gap-4 text-[10px] font-mono text-slate-500">
                            <div>
                                <span className="block text-slate-600 mb-1">ID</span>
                                <span className="select-all">{node.id}</span>
                            </div>

                            {/* Detailed Stats based on Type */}
                            {node.itemType === 'Arc' && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="block text-slate-600 mb-1">ORIGIN</span>
                                        {node.data?.source ? `[${node.data.source[0].toFixed(2)}, ${node.data.source[1].toFixed(2)}]` : 'N/A'}
                                    </div>
                                    <div>
                                        <span className="block text-slate-600 mb-1">TARGET</span>
                                        {node.data?.target ? `[${node.data.target[0].toFixed(2)}, ${node.data.target[1].toFixed(2)}]` : 'N/A'}
                                    </div>
                                </div>
                            )}

                            {node.value && (
                                <div>
                                    <span className="block text-slate-600 mb-1">VALUE / WEIGHT</span>
                                    <span className="text-emerald-500">{node.value}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
