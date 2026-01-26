
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
            setFormData(() => JSON.parse(JSON.stringify(data)));
        }
    }, [data]);

    useEffect(() => {
        setCurrentItemType(itemType);
    }, [itemType]);

    const handleTypeChange = (newType: ItemType) => {
        setCurrentItemType(newType);

        // Reset data based on type template
        setFormData((prev: any) => {
            const base = { name: prev.name, color: prev.color, info: prev.info, itemType: newType };

            if (newType === 'Line') {
                return { ...base, path: [[-46, -23], [-43, -22]] };
            } else if (newType === 'Arc') {
                return { ...base, source: [-46, -23], target: [-43, -22], value: 100 };
            } else if (newType === 'Scatterplot') {
                return { ...base, coordinates: [-46, -23] };
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
                const newPath = [...newData[key]];
                const newPoint = [...newPath[pathIndex]];
                newPoint[index] = value;
                newPath[pathIndex] = newPoint;
                newData[key] = newPath;
            } else {
                const newCoord = [...newData[key]];
                newCoord[index] = value;
                newData[key] = newCoord;
            }
            return newData;
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
        geoTarget: any
    ) => (
        <div key={keyProp} className="mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-emerald-400">
                    {label}
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
                        value={coords[1]} // DeckGL uses [Lon, Lat]
                        onChange={(e) => onChange(1, Number(e.target.value))}
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-slate-200 font-mono focus:border-emerald-500/50 outline-none"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-[10px] text-slate-500 mb-1">Longitude</label>
                    <input
                        type="number"
                        step="any"
                        value={coords[0]}
                        onChange={(e) => onChange(0, Number(e.target.value))}
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-slate-200 font-mono focus:border-emerald-500/50 outline-none"
                    />
                </div>
            </div>
        </div>
    );

    const renderField = (key: string, value: any) => {
        if (key === 'itemType') return null; // Handle separately in header

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
        if (key === 'path' && Array.isArray(value) && Array.isArray(value[0])) {
            const lastIdx = value.length - 1;
            return (
                <div key={key}>
                    {renderCoordinateInputs(`${key}-start`, 'Origem (Início)', value[0],
                        (idx, val) => handleCoordinateChange(key, idx, val, true, 0),
                        { key: 'path', isPath: true, pathIndex: 0 }
                    )}
                    {renderCoordinateInputs(`${key}-end`, 'Destino (Final)', value[lastIdx],
                        (idx, val) => handleCoordinateChange(key, idx, val, true, lastIdx),
                        { key: 'path', isPath: true, pathIndex: lastIdx }
                    )}
                </div>
            );
        }

        if (key === 'info') {
            return (
                <div key={key} className="mb-4">
                    <label className="block text-xs text-slate-400 mb-1">Markdown Info</label>
                    <textarea
                        value={value || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-slate-200 min-h-[100px] font-mono focus:border-emerald-500/50 outline-none resize-y"
                    />
                </div>
            );
        }

        if (typeof value === 'string' || typeof value === 'number') {
            return (
                <div key={key} className="mb-4">
                    <label className="block text-xs text-slate-400 mb-1 capitalize">{key}</label>
                    <input
                        type={typeof value === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={(e) => handleChange(key, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-slate-200 focus:border-emerald-500/50 outline-none"
                    />
                </div>
            );
        }
        return null; // Ensure null is returned if no match
    };

    return (
        <div className="fixed top-4 right-4 w-96 max-h-[90vh] flex flex-col bg-slate-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-right-4">
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
                            <option value="Line">Linha (Rota)</option>
                            <option value="Arc">Arco (Origem-Destino)</option>
                            <option value="Scatterplot">Ponto (Scatterplot)</option>
                            {/* <option value="GeoJson">GeoJson</option> */}
                        </select>
                    </div>
                )}
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-0">
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

