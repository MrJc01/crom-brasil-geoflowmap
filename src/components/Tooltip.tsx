
import React from 'react';

export interface TooltipInfo {
    object: any;
    x: number;
    y: number;
}

interface TooltipProps {
    info: TooltipInfo | null;
}

export const Tooltip: React.FC<TooltipProps> = ({ info }) => {
    if (!info || !info.object) return null;

    const { object, x, y } = info;

    // Determine content based on object shape
    // Should be generic enough or checking specific props
    const renderContent = () => {
        if (object.product) {
            // Arc / Flow data
            return (
                <>
                    <div style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '4px' }}>FLUXO DE EXPORTAÇÃO</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{object.product}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', gap: '12px' }}>
                        <span>Valor:</span>
                        <span style={{ color: '#00ff80', fontWeight: 'bold' }}>US$ {object.value}M</span>
                    </div>
                </>
            );
        }
        if (object.path) {
            // Path data
            return (
                <>
                    <div style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '4px' }}>INFRAESTRUTURA</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{object.name}</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>Capacidade: {object.capacity}</div>
                </>
            );
        }
        if (object.coordinates) {
            // Point data
            return (
                <>
                    <div style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '4px' }}>PORTO MARÍTIMO</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{object.name}</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>Status: {object.capacity}</div>
                </>
            );
        }
        if (object.name) {
            // Generic fallback for items with name (like Lines created in editor)
            return (
                <>
                    <div style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '4px' }}>INFO</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{object.name}</div>
                    {object.value && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', gap: '12px' }}>
                            <span>Valor:</span>
                            <span style={{ color: '#00ff80', fontWeight: 'bold' }}>{object.value}</span>
                        </div>
                    )}
                    {object.info && (
                        <div style={{ fontSize: '0.9rem', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{object.info}</div>
                    )}
                </>
            );
        }
        return <pre>{JSON.stringify(object, null, 2)}</pre>;
    };

    return (
        <div style={{
            position: 'absolute',
            zIndex: 100,
            pointerEvents: 'none',
            left: x + 10, // Offset to avoid cursor overlap
            top: y + 10,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            color: 'white',
            fontFamily: '"Inter", sans-serif',
            boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
            minWidth: '200px',
            backdropFilter: 'blur(4px)'
        }}>
            {renderContent()}
        </div>
    );
};
