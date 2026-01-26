
import React, { useState, useEffect } from 'react';
import { searchAddress } from '../utils/geocoding';

interface ItemEditorProps {
    data: any;
    layerType: string;
    onSave: (newData: any) => void;
    onClose: () => void;
}

export const ItemEditor: React.FC<ItemEditorProps> = ({ data, layerType, onSave, onClose }) => {
    const [formData, setFormData] = useState<any>({});
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
        onSave(formData);
    };

    // --- RENDERERS ---

    const renderGeocodingPanel = () => (
        <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px border rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Buscar cidade, endereço..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), performSearch())}
                />
                <button
                    onClick={(e) => { e.preventDefault(); performSearch(); }}
                    disabled={isSearching}
                    style={{ background: '#00ff80', border: 'none', borderRadius: '4px', padding: '0 12px', cursor: 'pointer', color: 'black' }}
                >
                    {isSearching ? '...' : '🔍'}
                </button>
            </div>

            {searchResults.length > 0 && (
                <div style={{ marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                    {searchResults.map((res, i) => (
                        <div
                            key={i}
                            onClick={() => applyLocation(res.lat, res.lon)}
                            style={{
                                padding: '6px',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                color: '#ddd'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {res.display_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderCoordinateInputs = (
        label: string,
        coords: number[],
        onChange: (idx: number, val: number) => void,
        geoTarget: any // Metadata to know which field we are geocoding
    ) => (
        <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.85rem', color: '#00ff80', fontWeight: 'bold' }}>
                    {label}
                </label>
                <button
                    type="button"
                    onClick={() => setTargetFieldForGeo(targetFieldForGeo === geoTarget ? null : geoTarget)}
                    style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                >
                    {targetFieldForGeo === geoTarget ? 'Cancelar Busca' : '📍 Buscar Endereço'}
                </button>
            </div>

            {targetFieldForGeo && JSON.stringify(targetFieldForGeo) === JSON.stringify(geoTarget) && renderGeocodingPanel()}

            <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem', color: '#888' }}>Latitude</label>
                    <input
                        type="number"
                        step="any"
                        value={coords[1]} // DeckGL uses [Lon, Lat]
                        onChange={(e) => onChange(1, Number(e.target.value))}
                        style={inputStyle}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem', color: '#888' }}>Longitude</label>
                    <input
                        type="number"
                        step="any"
                        value={coords[0]}
                        onChange={(e) => onChange(0, Number(e.target.value))}
                        style={inputStyle}
                    />
                </div>
            </div>
        </div>
    );

    const inputStyle = {
        width: '100%',
        padding: '8px',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        borderRadius: '4px',
        fontSize: '0.9rem'
    };

    const renderField = (key: string, value: any) => {
        if (key === 'source' && Array.isArray(value)) {
            return renderCoordinateInputs('Origem', value,
                (idx, val) => handleCoordinateChange(key, idx, val),
                { key: 'source' }
            );
        }
        if (key === 'target' && Array.isArray(value)) {
            return renderCoordinateInputs('Destino', value,
                (idx, val) => handleCoordinateChange(key, idx, val),
                { key: 'target' }
            );
        }
        if (key === 'coordinates' && Array.isArray(value)) {
            return renderCoordinateInputs('Localização', value,
                (idx, val) => handleCoordinateChange(key, idx, val),
                { key: 'coordinates' }
            );
        }
        if (key === 'path' && Array.isArray(value) && Array.isArray(value[0])) {
            const lastIdx = value.length - 1;
            return (
                <div key={key}>
                    {renderCoordinateInputs('Origem (Início)', value[0],
                        (idx, val) => handleCoordinateChange(key, idx, val, true, 0),
                        { key: 'path', isPath: true, pathIndex: 0 }
                    )}
                    {renderCoordinateInputs('Destino (Final)', value[lastIdx],
                        (idx, val) => handleCoordinateChange(key, idx, val, true, lastIdx),
                        { key: 'path', isPath: true, pathIndex: lastIdx }
                    )}
                </div>
            );
        }

        if (key === 'info') {
            return (
                <div key={key} style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>Markdown Info</label>
                    <textarea
                        value={value || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        style={{ ...inputStyle, minHeight: '100px', fontFamily: 'monospace', resize: 'vertical' }}
                    />
                </div>
            );
        }

        if (typeof value === 'string' || typeof value === 'number') {
            return (
                <div key={key} style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>{key}</label>
                    <input
                        type={typeof value === 'number' ? 'number' : 'text'}
                        value={value}
                        onChange={(e) => handleChange(key, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
                        style={inputStyle}
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: '350px',
            backgroundColor: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 2000,
            padding: '24px',
            color: 'white',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500, color: '#00ff80' }}>
                    Editar {layerType === 'group' ? 'Pasta' : 'Linha'}
                </h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleFormSubmit}>
                {Object.keys(formData).map(key => renderField(key, formData[key]))}

                <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                    <button
                        type="submit"
                        style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#00ff80',
                            border: 'none',
                            borderRadius: '6px',
                            color: 'black',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        Salvar
                    </button>
                </div>
            </form>
        </div>
    );
};
