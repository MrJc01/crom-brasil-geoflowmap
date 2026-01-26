
import React, { useState, useEffect } from 'react';

interface JsonEditorProps {
    isOpen: boolean;
    initialData: any;
    onSave: (data: any) => void;
    onClose: () => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ isOpen, initialData, onSave, onClose }) => {
    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setJsonText(JSON.stringify(initialData, null, 2));
            setError(null);
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonText);
            onSave(parsed);
            onClose();
        } catch (e: any) {
            setError(e.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                width: '80%',
                maxWidth: '800px',
                height: '80%',
                backgroundColor: '#1E1E1E',
                border: '1px solid #333',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                color: 'white',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 300 }}>Editar Configuração GLOBAL (JSON)</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
                    >✕</button>
                </div>

                <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                    <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        style={{
                            flex: 1,
                            backgroundColor: '#111',
                            color: '#00ff80',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            padding: '16px',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            resize: 'none',
                            outline: 'none'
                        }}
                    />
                    {error && (
                        <div style={{ color: '#ff4d4d', marginTop: '10px', fontSize: '0.9rem' }}>
                            Erro JSON: {error}
                        </div>
                    )}
                </div>

                <div style={{
                    padding: '20px',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            border: '1px solid #555',
                            color: 'white',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >Cancelar</button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#00ff80',
                            border: 'none',
                            color: 'black',
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};
