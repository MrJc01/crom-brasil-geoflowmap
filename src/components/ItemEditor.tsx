import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, Save } from 'lucide-react';
import { searchAddress } from '../utils/geocoding';
import type { ItemType } from '../lib/types';

interface ItemEditorProps {
    nodeId: string;
    data: any;
    layerType: string;
    itemType?: ItemType;
    onSave: (newData: any) => void;
    onClose: () => void;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({ nodeId, data, layerType, itemType, onSave, onClose }) => {
    // Merge defaults immediately
    const [formData, setFormData] = useState<any>({
        name: '',
        color: [0, 255, 255],
        value: 0,
        width: 3,
        size: 30, // Default Point Size
        shape: 'circle2d', // Default Shape
        ...data
    });

    const [currentItemType, setCurrentItemType] = useState<ItemType | undefined>(itemType);

    // Geocoding State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [targetFieldForGeo, setTargetFieldForGeo] = useState<string | null>(null); // 'source', 'target', 'coordinates'

    useEffect(() => {
        if (data) {
            const initialData = {
                width: 3,
                size: 30,
                shape: 'circle2d',
                color: [0, 255, 255],
                ...JSON.parse(JSON.stringify(data))
            };
            // Ensure Type consistency
            if (itemType) setCurrentItemType(itemType);
            setFormData(initialData);
        }
    }, [nodeId]); // Dependencies: only reset if nodeId changes

    const handleTypeChange = (newType: ItemType) => {
        setCurrentItemType(newType);

        // Smart Conversion of Data
        setFormData((prev: any) => {
            const base = {
                name: prev.name,
                color: prev.color,
                info: prev.info,
                value: prev.value,
                width: prev.width || 3,
                size: prev.size || 30,
                shape: prev.shape || 'circle2d'
            };

            // Logic to preserve coordinates if possible
            let startCoord = [-55, -15];
            let endCoord = null;
            if (prev.coordinates) startCoord = prev.coordinates;
            else if (prev.source) {
                startCoord = prev.source;
                if (prev.target) endCoord = prev.target;
            }
            else if (prev.path && prev.path.length > 0) startCoord = prev.path[0];

            if (newType === 'Line' || newType === 'Arc') {
                return {
                    ...base,
                    source: startCoord,
                    target: endCoord || [startCoord[0] + 2, startCoord[1] + 2]
                };
            } else if (newType === 'Scatterplot') {
                return {
                    ...base,
                    coordinates: startCoord
                };
            } else if (newType === 'GeoJson') {
                return { ...base, data: {} };
            }
            return base;
        });
    };

    const handleChange = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleCoordinateChange = (key: string, index: number, value: number) => {
        setFormData((prev: any) => {
            const currentCoords = prev[key] ? [...prev[key]] : [0, 0];
            currentCoords[index] = value;
            return { ...prev, [key]: currentCoords };
        });
    };

    // --- Geocoding Actions ---
    const performSearch = async () => {
        if (!searchQuery) return;
        setIsSearching(true);
        const results = await searchAddress(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
    };

    const applyLocation = (lat: number, lon: number) => {
        if (!targetFieldForGeo) return;
        handleCoordinateChange(targetFieldForGeo, 0, lon); // Lon
        handleCoordinateChange(targetFieldForGeo, 1, lat); // Lat
        setSearchResults([]);
        setSearchQuery('');
        setTargetFieldForGeo(null);
    };

    // --- Helpers ---
    const rgbToHex = (r: number, g: number, b: number) => {
        const componentToHex = (c: number) => {
            const hex = Math.round(c).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };

    const hexToRgb = (hex: string): [number, number, number] => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    };

    // --- RENDERERS ---
    const renderCoordinateInput = (label: string, fieldKey: string, value: number[]) => (
        <div className="mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{label}</label>
                <button
                    type="button"
                    onClick={() => setTargetFieldForGeo(targetFieldForGeo === fieldKey ? null : fieldKey)}
                    className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                >
                    <MapPin size={10} className="pointer-events-none" />
                    {targetFieldForGeo === fieldKey ? 'CANCELAR' : 'BUSCAR'}
                </button>
            </div>

            {/* Geocoding Panel */}
            {targetFieldForGeo === fieldKey && (
                <div className="mb-3 animate-in fade-in slide-in-from-top-1">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), performSearch())}
                            placeholder="Buscar cidade..."
                            className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button onClick={(e) => { e.preventDefault(); performSearch(); }} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 rounded">
                            <Search size={12} className={`pointer-events-none ${isSearching ? 'animate-pulse' : ''}`} />
                        </button>
                    </div>
                    {searchResults.length > 0 && (
                        <div className="mt-1 max-h-32 overflow-y-auto bg-black/60 rounded border border-white/10 custom-scrollbar">
                            {searchResults.map((res, i) => (
                                <div key={i} onClick={() => applyLocation(res.lat, res.lon)} className="p-1.5 text-[10px] text-slate-300 hover:bg-white/10 cursor-pointer border-b border-white/5">
                                    {res.display_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-2">
                <div className="flex-1">
                    <span className="text-[9px] text-slate-500 block mb-1">LONGITUDE</span>
                    <input
                        type="number" step="any"
                        value={value ? value[0] : 0}
                        onChange={e => handleCoordinateChange(fieldKey, 0, Number(e.target.value))}
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm font-mono text-slate-200 outline-none focus:border-emerald-500/50"
                    />
                </div>
                <div className="flex-1">
                    <span className="text-[9px] text-slate-500 block mb-1">LATITUDE</span>
                    <input
                        type="number" step="any"
                        value={value ? value[1] : 0}
                        onChange={e => handleCoordinateChange(fieldKey, 1, Number(e.target.value))}
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm font-mono text-slate-200 outline-none focus:border-emerald-500/50"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed top-4 right-4 w-96 max-h-[90vh] flex flex-col bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-right-4" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/5">
                <div>
                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">
                        Editar {layerType === 'group' ? 'Pasta' : 'Camada'}
                    </h3>
                    {layerType === 'item' && (
                        <select
                            value={currentItemType}
                            onChange={(e) => handleTypeChange(e.target.value as ItemType)}
                            className="bg-black/20 border border-white/10 rounded px-2 py-0.5 text-[10px] text-slate-300 outline-none focus:border-emerald-500/50"
                        >
                            <option value="Arc">Arc (Curvo 3D)</option>
                            <option value="Line">Line (Reto)</option>
                            <option value="Scatterplot">Scatterplot (Ponto)</option>
                        </select>
                    )}
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
                    <X size={18} className="pointer-events-none" />
                </button>
            </div>

            {/* Form */}
            <form
                className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
                onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, itemType: currentItemType }); }}
            >
                {/* Common Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Nome</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={e => handleChange('name', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Valor / Peso</label>
                        <input
                            type="number"
                            value={formData.value || 0}
                            onChange={e => handleChange('value', Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-sm text-white font-mono focus:border-emerald-500/50 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Cor</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={rgbToHex(formData.color?.[0] || 0, formData.color?.[1] || 0, formData.color?.[2] || 0)}
                                onChange={e => handleChange('color', hexToRgb(e.target.value))}
                                className="h-9 w-full bg-transparent cursor-pointer rounded overflow-hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Line Width - Show for Line/Arc */}
                {(currentItemType === 'Line' || currentItemType === 'Arc') && (
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Espessura da Linha</label>
                        <input
                            type="number"
                            value={formData.width || 3}
                            onChange={e => handleChange('width', Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-sm text-white font-mono focus:border-emerald-500/50 outline-none"
                        />
                    </div>
                )}

                {/* Geometry Config */}
                <div className="pt-2 border-t border-white/5">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Geometria</h4>

                    {(currentItemType === 'Arc' || currentItemType === 'Line') && (
                        <>
                            {renderCoordinateInput('Origem (Source)', 'source', formData.source)}
                            {renderCoordinateInput('Destino (Target)', 'target', formData.target)}
                        </>
                    )}

                    {currentItemType === 'Scatterplot' && (
                        <>
                            {renderCoordinateInput('Coordenadas', 'coordinates', formData.coordinates)}

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Formato</label>
                                    <select
                                        value={formData.shape || 'circle2d'}
                                        onChange={e => handleChange('shape', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
                                    >
                                        <option value="circle2d">Círculo 2D</option>
                                        <option value="square2d">Quadrado 2D</option>
                                        <option value="circle3d">Cilindro 3D</option>
                                        <option value="square3d">Cubo 3D</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Tamanho (Raio)</label>
                                    <input
                                        type="number"
                                        value={formData.size || 30}
                                        onChange={e => handleChange('size', Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-sm text-white font-mono focus:border-emerald-500/50 outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Markdown Info */}
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Info (Markdown)</label>
                    <textarea
                        value={formData.info || ''}
                        onChange={e => handleChange('info', e.target.value)}
                        className="w-full h-24 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 font-mono focus:border-emerald-500/50 outline-none resize-none"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all mt-4"
                >
                    <Save size={16} className="pointer-events-none" /> Salvar
                </button>
            </form>
        </div>
    );
};
