
import React, { useState, useEffect } from 'react';
import { searchAddress } from '../utils/geocoding';
import { Search, X, MapPin } from 'lucide-react';
import type { ItemType } from '../types/ProjectTypes';

interface ItemEditorProps {
    data: any;
    layerType: string;
    itemType?: ItemType; // New prop
    onSave: (newData: any) => void;
    onClose: () => void;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({ data, layerType, itemType, onSave, onClose }) => {
    const [formData, setFormData] = useState<any>({});
    const [currentItemType, setCurrentItemType] = useState<ItemType | undefined>(itemType);

    // Geocoding State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [targetFieldForGeo, setTargetFieldForGeo] = useState<{
        key: string;
        index?: number;
        isPath?: boolean;
        pathIndex?: number;
    } | null>(null);

    useEffect(() => {
        if (data) {
            // Merge with defaults to ensure controls like width appear even for legacy items
            setFormData(() => ({
                width: 3,
                color: [0, 255, 255],
                ...JSON.parse(JSON.stringify(data))
            }));
        }
    }, [data]);

    useEffect(() => {
        setCurrentItemType(itemType);
    }, [itemType]);

    const handleTypeChange = (newType: ItemType) => {
        setCurrentItemType(newType);

        // Reset data based on type template
        setFormData((prev: any) => {
            const base = { name: prev.name, color: prev.color, info: prev.info, itemType: newType, width: 3 };

            if (newType === 'Line') {
                return { ...base, path: [[-46, -23], [-43, -22]] };
            } else if (newType === 'Arc') {
                return { ...base, source: [-46, -23], target: [-43, -22], value: 100 };
            } else if (newType === 'Scatterplot') {
                return { ...base, coordinates: [-46, -23], radius: 1000 };
            } else if (newType === 'GeoJson') {
                // Simplistic template for GeoJson (could be complex)
                return { ...base, data: {} };
            }
            return base;
        });
    };

    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleCoordinateChange = (key: string, index: number, value: number, isPath = false, pathIndex = 0) => {
        setFormData((prev: any) => {
            const newData = { ...prev };

            if (isPath) {
                // Ensure path exists
                const newPath = Array.isArray(newData[key]) ? [...newData[key]] : [];
                // Ensure sub-array exists
                if (!newPath[pathIndex]) newPath[pathIndex] = [0, 0];

                const newPoint = [...newPath[pathIndex]];
                newPoint[index] = value;
                newPath[pathIndex] = newPoint;
                newData[key] = newPath;
            } else {
                const newCoord = [...(newData[key] || [0, 0])];
                newCoord[index] = value;
                newData[key] = newCoord;
            }
            return newData;
        });
    };

    const handleAddPathPoint = (key: string) => {
        setFormData((prev: any) => {
            const currentPath = Array.isArray(prev[key]) ? prev[key] : [];
            const lastPoint = currentPath.length > 0 ? currentPath[currentPath.length - 1] : [-46, -23];
            // Add a new point slighty offset from the last one for visibility
            const newPoint = [lastPoint[0] + 0.5, lastPoint[1] + 0.5];
            return { ...prev, [key]: [...currentPath, newPoint] };
        });
    };

    const handleRemovePathPoint = (key: string, index: number) => {
        setFormData((prev: any) => {
            const currentPath = [...(prev[key] || [])];
            if (currentPath.length <= 2) return prev; // Keep at least 2 points for a line
            currentPath.splice(index, 1);
            return { ...prev, [key]: currentPath };
        });
    };

    const performSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        const results = await searchAddress(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
    };

    const applyLocation = (lat: number, lon: number) => {
        if (!targetFieldForGeo) return;

        const { key, isPath, pathIndex } = targetFieldForGeo;
        // Apply Lat (index 1) and Lon (index 0)

        handleCoordinateChange(key, 0, lon, isPath, pathIndex || 0); // Lon
        handleCoordinateChange(key, 1, lat, isPath, pathIndex || 0); // Lat

        setSearchResults([]);
        setSearchQuery('');
        setTargetFieldForGeo(null); // Close search mode for this field
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Pack itemType into formData if needed or handle upstream
        onSave({ ...formData, itemType: currentItemType });
    };

    // --- RENDERERS ---

    const renderGeocodingPanel = () => (
        <div className="mt-2 p-3 bg-black/40 rounded-lg border border-white/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Buscar cidade, endereço..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), performSearch())}
                />
                <button
                    onClick={(e) => { e.preventDefault(); performSearch(); }}
                    disabled={isSearching}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black rounded px-3 flex items-center justify-center transition-colors px-3 py-1.5"
                >
                    {isSearching ? <span className="text-xs font-bold animate-pulse">...</span> : <Search size={14} className="pointer-events-none" />}
                </button>
            </div>

            {searchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto custom-scrollbar border-t border-white/5 pt-2">
                    {searchResults.map((res, i) => (
                        <div
                            key={i}
                            onClick={() => applyLocation(res.lat, res.lon)}
                            className="p-2 text-xs text-slate-300 hover:bg-white/10 rounded cursor-pointer transition-colors border-b border-white/5 last:border-0"
                        >
                            {res.display_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCoordinateInputs = (
        keyProp: string, // Changed to allow passing Key
        label: string,
        coords: number[],
        onChange: (idx: number, val: number) => void,
        geoTarget: any,
        onRemove?: () => void
    ) => (
        <div key={keyProp} className="mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    {label}
                    {onRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-red-500 hover:text-red-400 text-[10px] uppercase font-bold tracking-wider"
                            title="Remover este ponto"
                        >
                            (Remover)
                        </button>
                    )}
                </label>
                <button
                    type="button"
                    onClick={() => setTargetFieldForGeo(targetFieldForGeo === geoTarget ? null : geoTarget)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    {targetFieldForGeo === geoTarget ? 'Cancelar' : <><MapPin size={10} className="pointer-events-none" /> Buscar</>}
                </button>
            </div>

            {targetFieldForGeo && JSON.stringify(targetFieldForGeo) === JSON.stringify(geoTarget) && renderGeocodingPanel()}

            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-1">Latitude</label>
                    <input
                        type="number"
                        step="any"
                        value={coords ? coords[1] : 0} // DeckGL uses [Lon, Lat]
                        onChange={(e) => onChange(1, Number(e.target.value))}
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-slate-200 font-mono focus:border-emerald-500/50 outline-none"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-1">Longitude</label>
                    <input
                        type="number"
                        step="any"
                        value={coords ? coords[0] : 0}
                        onChange={(e) => onChange(0, Number(e.target.value))}
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-slate-200 font-mono focus:border-emerald-500/50 outline-none"
                    />
                </div>
            </div>
        </div>
    );

    const renderColorInput = (key: string, value: [number, number, number], onChange: (val: [number, number, number]) => void) => (
        <div key={key} className="mb-4">
            <label className="block text-xs text-slate-400 mb-1 capitalize">Cor (RGB)</label>
            <div className="flex gap-2">
                {[0, 1, 2].map(idx => (
                    <div key={idx} className="flex-1">
                        <input
                            type="number"
                            min="0" max="255"
                            value={value ? value[idx] : 0}
                            onChange={(e) => {
                                const newValue = [...(value || [0, 0, 0])] as [number, number, number];
                                newValue[idx] = Number(e.target.value);
                                onChange(newValue);
                            }}
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-center text-slate-200 focus:border-emerald-500/50 outline-none"
                        />
                    </div>
                ))}
                <div
                    className="w-8 h-8 rounded border border-white/10"
                    style={{ backgroundColor: value ? `rgb(${value[0]},${value[1]},${value[2]})` : 'transparent' }}
                >
                </div>
            </div>
        </div >
    );

    const renderAppearanceSection = () => (
        <div className="mb-4 pt-4 border-t border-white/5">
            <label className="block text-xs font-bold text-emerald-400 mb-3 uppercase tracking-wider">Aparência</label>

            {/* LINE TYPE (Solid / Dashed) - Valid for Lines & maybe Arcs if extension supported it universally, but mainly Lines */}
            {currentItemType === 'Line' && (
                <div className="mb-3">
                    <label className="block text-[10px] text-slate-500 mb-1">Estilo da Linha</label>
                    <select
                        value={formData.appearance?.type || 'solid'}
                        onChange={(e) => {
                            const newType = e.target.value;
                            setFormData((prev: any) => ({
                                ...prev,
                                appearance: { ...prev.appearance, type: newType }
                            }));
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                    >
                        <option value="solid">Sólido</option>
                        <option value="dashed">Pontilhado</option>
                    </select>
                </div>
            )}

            {/* COLOR MODE (Solid / Gradient) - Valid for Arcs */}
            {currentItemType === 'Arc' && (
                <div className="mb-3">
                    <label className="block text-[10px] text-slate-500 mb-1">Modo de Cor</label>
                    <select
                        value={formData.appearance?.colorType || 'solid'}
                        onChange={(e) => {
                            const newType = e.target.value;
                            setFormData((prev: any) => ({
                                ...prev,
                                appearance: { ...prev.appearance, colorType: newType }
                            }));
                        }}
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                    >
                        <option value="solid">Cor Fixa (Sólida)</option>
                        <option value="gradient">Gradiente (Origem → Destino)</option>
                    </select>

                    {/* Gradient Target Color Picker */}
                    {formData.appearance?.colorType === 'gradient' && (
                        <div className="mt-2 pl-2 border-l border-white/10">
                            {renderColorInput('targetColor', formData.targetColor, (val) => handleChange('targetColor', val))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderField = (key: string, value: any) => {
        if (key === 'itemType') return null;
        if (key === 'appearance') return null; // Handle separately
        if (key === 'targetColor') return null; // Handle inside Appearance section

        // Specific fields
        if (key === 'color' && Array.isArray(value)) {
            return renderColorInput(key, value as [number, number, number], (val) => handleChange(key, val));
        }

        if (key === 'getWidth') { // DeckGL often uses getWidth or width. Let's assume user uses 'width' or 'getWidth'. 
            // In our mock data, lines don't have width property yet, we need to add it or support generic number.
            // But let's check generic number renderer first.
            // Actually, for better UX let's force a "width" field if itemType is Line.
        }

        if (key === 'source' && Array.isArray(value)) {
            return renderCoordinateInputs(key, 'Origem', value,
                (idx, val) => handleCoordinateChange(key, idx, val),
                { key: 'source' }
            );
        }
        if (key === 'target' && Array.isArray(value)) {
            return renderCoordinateInputs(key, 'Destino', value,
                (idx, val) => handleCoordinateChange(key, idx, val),
                { key: 'target' }
            );
        }
        if (key === 'coordinates' && Array.isArray(value)) {
            return renderCoordinateInputs(key, 'Localização', value,
                (idx, val) => handleCoordinateChange(key, idx, val),
                { key: 'coordinates' }
            );
        }
        if (key === 'path' && Array.isArray(value)) {
            // New Multi-point Path Renderer
            return (
                <div key={key} className="mb-4 border-l-2 border-emerald-500/30 pl-3">
                    <label className="block text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wide">Rota / Waypoints</label>

                    {value.map((point: number[], idx: number) => (
                        renderCoordinateInputs(`${key}-${idx}`, `Ponto ${idx + 1} ${idx === 0 ? '(Início)' : idx === value.length - 1 ? '(Final)' : ''}`,
                            point,
                            (coordIdx, val) => handleCoordinateChange(key, coordIdx, val, true, idx),
                            { key: 'path', isPath: true, pathIndex: idx },
                            // Allow removal if more than 2 points
                            value.length > 2 ? () => handleRemovePathPoint(key, idx) : undefined
                        )
                    ))}

                    <button
                        type="button"
                        onClick={() => handleAddPathPoint(key)}
                        className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 border-dashed rounded flex items-center justify-center gap-2 transition-all text-xs font-bold uppercase"
                    >
                        + Adicionar Ponto à Rota
                    </button>
                </div>
            );
        }

        if (key === 'info') {
            return (
                <div key={key} className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs text-slate-400">Notas / Conteúdo (Markdown)</label>
                        <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Suporta Checks [ ]</span>
                    </div>
                    <textarea
                        value={value || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-slate-200 min-h-[120px] font-mono focus:border-emerald-500/50 outline-none resize-y placeholder-slate-600"
                        placeholder="# Título&#10;- [ ] Pendência 1&#10;- [x] Feito"
                    />
                </div>
            );
        }

        if (typeof value === 'string' || typeof value === 'number') {
            return (
                <div key={key} className="mb-4">
                    <label className="block text-xs text-slate-400 mb-1 capitalize">{key === 'width' ? 'Espessura (px)' : key}</label>
                    <input
                        type={typeof value === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={(e) => handleChange(key, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-slate-200 focus:border-emerald-500/50 outline-none"
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-4 right-4 w-96 max-h-[90vh] flex flex-col bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-right-4"
        >
            <div className="flex justify-between items-center p-4 border-b border-white/5">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                    Editar {layerType === 'group' ? 'Pasta' : 'Camada'}
                </h3>
                <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-white transition-colors"
                >
                    <X size={18} className="pointer-events-none" />
                </button>
            </div>

            <div className="p-4 border-b border-white/5">
                {layerType === 'item' && (
                    <div className="mb-4">
                        <label className="block text-xs text-slate-400 mb-1">Tipo de Camada</label>
                        <select
                            value={currentItemType}
                            onChange={(e) => handleTypeChange(e.target.value as ItemType)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-slate-200 focus:border-emerald-500/50 outline-none"
                        >
                            <option value="Line">Linha (Rota Completa)</option>
                            <option value="Arc">Arco (Origem-Destino)</option>
                            <option value="Scatterplot">Ponto (Scatterplot)</option>
                            {/* <option value="GeoJson">GeoJson</option> */}
                        </select>
                        {currentItemType === 'Arc' && (
                            <div className="mt-2 text-[10px] text-slate-500 p-2 bg-white/5 rounded border border-white/5">
                                <span className="text-amber-400 font-bold">Nota:</span> Arcos conectam 2 pontos. Use "Linha" para rotas complexas.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-0">
                {renderAppearanceSection()}
                {Object.keys(formData).map(key => renderField(key, formData[key]))}

                <div className="mt-4 pt-4 border-t border-white/5">
                    <button
                        type="submit"
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
};

