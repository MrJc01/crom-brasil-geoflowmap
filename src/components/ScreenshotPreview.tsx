import React from 'react';
import { Download, X } from 'lucide-react';

interface ScreenshotPreviewProps {
    imageUrl: string;
    onClose: () => void;
    onDownload: () => void;
}

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({ imageUrl, onClose, onDownload }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-w-[90vw] max-h-[90vh] flex flex-col p-4">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        📸 Preview da Captura
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Image Preview Container */}
                <div className="flex-1 overflow-hidden rounded-lg border border-white/5 bg-black/50 flex items-center justify-center">
                    <img
                        src={imageUrl}
                        alt="Map Screenshot"
                        className="max-w-full max-h-[70vh] object-contain"
                    />
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={onDownload}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-600/20 flex items-center gap-2 font-bold transition-all text-sm"
                    >
                        <Download size={18} />
                        Baixar Imagem
                    </button>
                </div>
            </div>
        </div>
    );
};
