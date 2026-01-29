import { useMemo, useState } from 'react';
import Map, { useControl, type ViewState } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ArcLayer, ScatterplotLayer, LineLayer, ColumnLayer } from '@deck.gl/layers';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { ProjectNode } from './types';
import { Tooltip } from './components/Tooltip';
import type { TooltipInfo } from './components/Tooltip';

function DeckGLOverlay(props: { layers: any[] }) {
    const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
    overlay.setProps(props);
    return null;
}

export interface CromGeoMapProps {
    nodes: ProjectNode[];
    onNodeClick?: (node: ProjectNode) => void;
    // Keeping onEditNode as a callback is fine, it's not a UI dependency. 
    // But if the goal is strictly "Remover dependências de UI... O mapa deve apenas disparar eventos"
    // onEditNode IS an event.
    onEditNode?: (node: ProjectNode) => void;
    initialViewState?: Partial<ViewState>;
}

export function CromGeoMap({ nodes, onNodeClick, onEditNode: _onEditNode, initialViewState }: CromGeoMapProps) {
    const [hoverInfo, setHoverInfo] = useState<TooltipInfo | null>(null);
    const [cursor, setCursor] = useState<string>('default');

    const defaultViewState = {
        longitude: -55,
        latitude: -15,
        zoom: 3.5,
        pitch: 45,
        bearing: 0
    };

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
                    id: `${node.id}-${node.itemType}`,
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
                    // d is unused in generic but used in specific layers via accessor if needed, 
                    // but here we use node props.
                    // to shut up linter:
                    void d;
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
                        getWidth: (_d: any) => node.width || 3,
                    }));
                } else if (node.itemType === 'Line') {
                    layers.push(new LineLayer({
                        ...commonProps,
                        getSourcePosition: (d: any) => d.source,
                        getTargetPosition: (d: any) => d.target,
                        getColor: getColor,
                        getWidth: (_d: any) => node.width || 3,
                    }));
                } else if (node.itemType === 'Scatterplot') {
                    // Shape logic
                    const shape = node.shape || 'circle2d';
                    const size = node.size || 30; // Radius or Width
                    const is3D = shape === 'circle3d' || shape === 'square3d';

                    if (shape === 'circle2d') {
                        layers.push(new ScatterplotLayer({
                            ...commonProps,
                            getPosition: (d: any) => d.coordinates,
                            getFillColor: getColor,
                            getRadius: (_d: any) => size * 100, // Scale adjustment
                            radiusMinPixels: 4,
                        }));
                    } else {
                        // Square 2D, Square 3D, Cylinder (Circle 3D) -> All can use ColumnLayer
                        const isCylinder = shape === 'circle3d'; // ColumnLayer has resolution to make it cylindrical

                        layers.push(new ColumnLayer({
                            ...commonProps,
                            getPosition: (d: any) => d.coordinates,
                            getFillColor: getColor,
                            getElevation: (_d: any) => is3D ? (node.value ? node.value * 1000 : 50000) : 0, // Elevation only for 3D
                            diskResolution: isCylinder ? 20 : 4, // 4 for Square, 20 for Cylinder
                            radius: size * 100, // Size scaling
                            extruded: is3D,
                            pickable: true,
                            material: is3D ? true : undefined // Lighting
                        }));
                    }
                }
            }
        });

        return layers;
    };

    const layers = useMemo(() => getFlattenedLayers(nodes), [nodes]);

    return (
        <Map
            initialViewState={{
                ...defaultViewState,
                ...initialViewState
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
