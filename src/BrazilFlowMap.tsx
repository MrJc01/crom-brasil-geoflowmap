import React, { useMemo } from 'react'; // Added useMemo for performance
import Map, { useControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox'; // Adapter for shared context
import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

// Configuração inicial da câmera
const INITIAL_VIEW_STATE = {
    longitude: -55,
    latitude: -15,
    zoom: 3,
    pitch: 30,
    bearing: 0
};

// Dados fictícios
const DATA_FLOWS = [
    {
        source: [-46.63, -23.55], // SP
        target: [-80.19, 25.76],  // Miami, USA
        value: 100,
        color: [255, 0, 128]
    },
    {
        source: [-55.42, -12.64], // MT
        target: [116.40, 39.90],  // Beijing, China
        value: 200,
        color: [0, 128, 255]
    },
    {
        source: [-43.17, -22.90], // RJ
        target: [-9.13, 38.72],   // Lisboa, Europa
        value: 150,
        color: [0, 255, 128]
    }
];

const DATA_PORTS = [
    { coordinates: [-46.33, -23.96], name: "Porto de Santos" },
    { coordinates: [-43.17, -22.90], name: "Porto do Rio" },
    { coordinates: [-48.50, -1.45], name: "Porto de Belém" }
];

// Componente auxiliar para injetar o DeckGL no contexto do MapLibre
function DeckGLOverlay(props: { layers: any[] }) {
    const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
    overlay.setProps(props);
    return null;
}

export function BrazilFlowMap() {
    const layers = useMemo(() => [
        new ArcLayer({
            id: 'arcs',
            data: DATA_FLOWS,
            getSourcePosition: d => d.source,
            getTargetPosition: d => d.target,
            getSourceColor: [0, 200, 255],
            getTargetColor: d => d.color,
            getWidth: d => d.value * 0.05,
            getHeight: 0.5,
        }),
        new ScatterplotLayer({
            id: 'ports',
            data: DATA_PORTS,
            getPosition: d => d.coordinates,
            getFillColor: [255, 255, 0],
            getRadius: 50000,
            radiusMinPixels: 5,
            opacity: 0.8
        })
    ], []);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {/* 
        ESTRATÉGIA FINAL: Shared Context (Interleaved)
        Usamos o MapboxOverlay via useControl.
        Isso injeta as camadas do deck.gl DIRETAMENTE no pipeline de renderização do maplibre-gl.
        Resultado: 1 Contexto WebGL, Performance máxima, Sem crash de redimensionamento.
      */}
            <Map
                initialViewState={INITIAL_VIEW_STATE}
                mapLib={maplibregl}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                style={{ width: '100%', height: '100%' }}
            >
                <DeckGLOverlay layers={layers} />
            </Map>

            {/* Legenda simples sobreposta */}
            <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                fontFamily: 'sans-serif',
                pointerEvents: 'none',
                zIndex: 10
            }}>
                <h2 style={{ margin: '0 0 10px 0' }}>Exportações Brasil</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'block', width: 10, height: 10, background: 'cyan' }}></span> Origem
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'block', width: 10, height: 10, background: 'magenta' }}></span> USA
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'block', width: 10, height: 10, background: 'blue' }}></span> China
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'block', width: 10, height: 10, background: '#00ff80' }}></span> Europe
                </div>
            </div>
        </div>
    );
}
