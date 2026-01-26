import { useMemo, useState } from 'react';
import Map, { useControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ArcLayer, ScatterplotLayer, PathLayer, GeoJsonLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { ProjectNode } from './types/ProjectTypes';
import { Tooltip } from './components/Tooltip';
import type { TooltipInfo } from './components/Tooltip';
import { InfoPopup } from './components/InfoPopup';

const INITIAL_VIEW_STATE = {
    longitude: -55,
    latitude: -15,
    zoom: 3.5,
    pitch: 45,
    bearing: 0
};

function DeckGLOverlay(props: { layers: any[] }) {
    const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
    overlay.setProps(props);
    return null;
}

interface BrazilFlowMapProps {
    nodes: ProjectNode[];
    onNodeClick?: (node: ProjectNode) => void;
}

export function BrazilFlowMap({ nodes, onNodeClick }: BrazilFlowMapProps) {
    // Interactions
    const [hoverInfo, setHoverInfo] = useState<TooltipInfo | null>(null);
    const [cursor, setCursor] = useState<string>('default');
    const [popupState, setPopupState] = useState<{ isOpen: boolean; content?: string; title?: string; position?: { x: number, y: number } }>({ isOpen: false });

    // Helper to flatten tree to DeckGL Layers
    const getFlattenedLayers = (nodes: ProjectNode[]): any[] => {
        let layers: any[] = [];

        nodes.forEach(node => {
            if (!node.visible) return;

            if (node.type === 'group' && node.children) {
                layers = [...layers, ...getFlattenedLayers(node.children)];
            } else if (node.type === 'item') {
                const layerData = [node.data];

                const commonProps = {
                    id: node.id,
                    data: layerData,
                    pickable: true,
                    onHover: (info: any) => {
                        if (info.object && !popupState.isOpen) {
                            setHoverInfo({ object: info.object, x: info.x, y: info.y });
                            setCursor('pointer');
                        } else {
                            setHoverInfo(null);
                            setCursor('default');
                        }
                    },
                    onClick: (info: any) => {
                        if (info.object) {
                            setPopupState({
                                isOpen: true,
                                title: node.name,
                                content: node.info,
                                position: { x: info.x, y: info.y }
                            });
                            // Close tooltip when clicking
                            setHoverInfo(null);
                        }
                    }
                };

                if (node.itemType === 'Arc') {
                    layers.push(new ArcLayer({
                        ...commonProps,
                        getSourcePosition: (d: any) => d.source,
                        getTargetPosition: (d: any) => d.target,
                        getSourceColor: [0, 0, 0, 0],
                        getTargetColor: node.color || [255, 255, 255],
                        getWidth: 3,
                    }));
                } else if (node.itemType === 'Scatterplot') {
                    layers.push(new ScatterplotLayer({
                        ...commonProps,
                        getPosition: (d: any) => d.coordinates,
                        getFillColor: node.color || [255, 255, 0],
                        getRadius: 30000,
                        opacity: 0.9,
                        stroked: true,
                        getLineColor: [255, 255, 255],
                        getLineWidth: 2000
                    }));
                } else if (node.itemType === 'Line') {
                    layers.push(new PathLayer({
                        ...commonProps,
                        getPath: (d: any) => d.path,
                        getColor: node.color || [0, 255, 255],
                        getWidth: 3000,
                        capRounded: true,
                        jointRounded: true
                    }));
                }
                // Add GeoJson support as requested in prompt, though data config usually maps to Line currently.
                // If we had explicit GeoJson type:
                else if (node.itemType === 'GeoJson' as any) { // Type casting if needed or update ItemType
                    layers.push(new GeoJsonLayer({
                        ...commonProps,
                        getLineColor: node.color || [255, 255, 255],
                        getFillColor: [0, 0, 0, 0], // transparent fill for now
                        lineWidthMinPixels: 2
                    }));
                }
            }
        });

        return layers;
    };

    const deckLayers = useMemo(() => getFlattenedLayers(nodes), [nodes, popupState.isOpen]);

    return (
        <div style={{ width: '100%', height: '100%', cursor }}>
            <Map
                initialViewState={INITIAL_VIEW_STATE}
                mapLib={maplibregl}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                style={{ width: '100%', height: '100%' }}
            >
                <DeckGLOverlay layers={deckLayers} />
            </Map>

            {!popupState.isOpen && <Tooltip info={hoverInfo} />}

            <InfoPopup
                isOpen={popupState.isOpen}
                title={popupState.title}
                content={popupState.content}
                position={popupState.position}
                onClose={() => setPopupState({ isOpen: false })}
                onEdit={() => {
                    // This creates a circular dependency or requires lifting Popup state too.
                    // For now, let's keep view-only in map, edit via sidebar.
                    alert("Para editar, use a Sidebar lateral.");
                }}
            />
        </div>
    );
}
