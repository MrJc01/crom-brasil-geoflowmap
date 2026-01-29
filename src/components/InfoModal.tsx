import React from 'react';
import { X, Edit, Calendar } from 'lucide-react';
import Markdown from 'react-markdown';
import type { ProjectNode } from '../lib/types';

interface InfoModalProps {
    node: ProjectNode | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (node: ProjectNode) => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ node, isOpen, onClose, onEdit }) => {
    if (!isOpen || !node) return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]"
                            style={{
                                backgroundColor: node.color ? `rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})` : '#ccc',
                                color: node.color ? `rgb(${node.color[0]}, ${node.color[1]}, ${node.color[2]})` : '#ccc'
                            }}
                        />
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{node.name}</h2>
                            <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">
                                {node.itemType || 'Layer'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { onClose(); onEdit(node); }}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Edit size={16} className="pointer-events-none" />
                            Editar
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <Calendar size={32} className="opacity-20 pointer-events-none" />
                            </div>
                            <p className="text-center">Nenhuma informação adicional registrada.<br />Use o modo de edição para adicionar notas.</p>
                        </div>
                    )}

                    {/* Technical Metadata (Optional) */}
                    <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4 text-xs font-mono text-slate-500">
                        <div>
                            <span className="block text-slate-600 mb-1">ID</span>
                            {node.id}
                        </div>
                        <div>
                            <span className="block text-slate-600 mb-1">TYPE CONFIG</span>
                            {/* Mostra um resumo dos dados técnicos */}
                            {node.itemType === 'Line' && node.data?.path ? `${node.data.path.length} points` : ''}
                            {node.itemType === 'Arc' ? `Origin -> Target` : ''}
                            {node.itemType === 'Scatterplot' && node.data?.coordinates ? `[${node.data.coordinates[0]}, ${node.data.coordinates[1]}]` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
