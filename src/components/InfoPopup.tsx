
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface InfoPopupProps {
    isOpen: boolean;
    content?: string;
    title?: string;
    onClose: () => void;
    onEdit?: () => void;
    position?: { x: number; y: number }; // Optional for click positioning
}

export const InfoPopup: React.FC<InfoPopupProps> = ({ isOpen, content, title, onClose, onEdit, position }) => {
    if (!isOpen) return null;

    // If position is provided, render as absolute popup near click, otherwise centered modal
    const style: React.CSSProperties = position
        ? {
            position: 'absolute',
            top: position.y,
            left: position.x,
            transform: 'translate(-50%, -100%) translateY(-20px)', // Centered above click
            width: '300px',
            maxHeight: '400px'
        }
        : {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '500px',
            maxHeight: '600px'
        };

    const containerStyle: React.CSSProperties = {
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '24px',
        color: 'white',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        zIndex: 5000,
        display: 'flex',
        flexDirection: 'column',
        ...style
    };

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#00ff80' }}>
                    {title || 'Informações'}
                </h2>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    ✕
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', fontSize: '0.95rem', lineHeight: '1.6', color: '#ddd' }}>
                {content ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                    <p style={{ fontStyle: 'italic', color: '#666' }}>Sem descrição disponível.</p>
                )}
            </div>

            {onEdit && (
                <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onEdit}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'center'
                        }}
                    >
                        <span>✏️</span> Editar Dados
                    </button>
                </div>
            )}
        </div>
    );
};
