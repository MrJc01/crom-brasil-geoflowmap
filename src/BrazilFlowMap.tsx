import { useMemo, useState } from 'react';
import Map, { useControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ArcLayer, ScatterplotLayer, LineLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { ProjectNode } from './types/ProjectTypes';
import { Tooltip } from './components/Tooltip';
import type { TooltipInfo } from './components/Tooltip';

function DeckGLOverlay(props: { layers: any[] }) {
    const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
    overlay.setProps(props);
    return null;
}

interface BrazilFlowMapProps {
    nodes: ProjectNode[];
    onNodeClick?: (node: ProjectNode) => void;
    onEditNode?: (node: ProjectNode) => void;
}

export function BrazilFlowMap({ nodes, onNodeClick, onEditNode }: BrazilFlowMapProps) {
    const [hoverInfo, setHoverInfo] = useState<TooltipInfo | null>(null);
    const [cursor, setCursor] = useState<string>('default');

    const getFlattenedLayers = (nodes: ProjectNode[]): any[] => {
        let layers: any[] = [];

        nodes.forEach(node => {
            if (!node.visible) return;

            if (node.type === 'group' && node.children) {
                layers = [...layers, ...getFlattenedLayers(node.children)];
            } else if (node.type === 'item') {
                const layerData = [node.data];

                // Generic accessor for standardized props
                const commonProps = {
                    id: node.id,
                    data: layerData,
                    pickable: true,
                    onHover: (info: any) => {
                        if (info.object) {
                            setHoverInfo({
                                object: {
                                    ...info.object,
                                    name: node.name,
                                    value: node.value,
                                    info: node.info
                                },
                                x: info.x,
                                y: info.y
                            });
                            setCursor('pointer');
                        } else {
                            setHoverInfo(null);
                            setCursor('default');
                        }
                    },
                    onClick: (info: any) => {
                        if (info.object && onNodeClick) {
                            onNodeClick(node);
                        }
                    }
                };

                // Robust Color Accessor
                const getColor = (d: any): [number, number, number] => {
                    const c = node.color;
                    if (Array.isArray(c) && c.length >= 3) {
                        return c as [number, number, number];
                    }
                    return [255, 0, 255];
                };

                if (node.itemType === 'Arc') {
                    layers.push(new ArcLayer({
                        ...commonProps,
                        getSourcePosition: (d: any) => d.source,
                        getTargetPosition: (d: any) => d.target,
                        getSourceColor: getColor,
                        getTargetColor: (d: any) => node.targetColor || getColor(d),
                        getWidth: (d: any) => node.width || 3,
                    }));
                } else if (node.itemType === 'Line') {
                    layers.push(new LineLayer({
                        ...commonProps,
                        getSourcePosition: (d: any) => d.source,
                        getTargetPosition: (d: any) => d.target,
                        getColor: getColor,
                        getWidth: (d: any) => node.width || 3,
                    }));
                } else if (node.itemType === 'Scatterplot') {
                    layers.push(new ScatterplotLayer({
                        ...commonProps,
                        getPosition: (d: any) => d.coordinates,
                        getFillColor: getColor,
                        getRadius: (d: any) => (node.value ? node.value * 100 : 30000),
                        radiusMinPixels: 4,
                    }));
                }
            }
        });

        return layers;
    };

    const layers = useMemo(() => getFlattenedLayers(nodes), [nodes]);

    return (
        <Map
            initialViewState={{
                longitude: -55,
                latitude: -15,
                zoom: 3.5,
                pitch: 45,
                bearing: 0
            }}
            style={{ width: '100vw', height: '100vh' }}
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            cursor={cursor}
            mapLib={maplibregl}
            canvasContextAttributes={{ preserveDrawingBuffer: true }}
        >
            <DeckGLOverlay layers={layers} />
            {hoverInfo && hoverInfo.object && (
                <Tooltip info={hoverInfo} />
            )}
        </Map>
    );
}
