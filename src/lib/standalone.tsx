import React from 'react';
import ReactDOM from 'react-dom/client';
import { CromGeoMap } from './CromGeoMap';
import type { ProjectNode } from './types';
import 'maplibre-gl/dist/maplibre-gl.css';

// Expor globalmente
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).CromGeoMap = CromGeoMap;

// Função helper para inicializar
(window as any).initCromGeoFlowMap = (
    containerId: string,
    nodes: ProjectNode[],
    options?: { initialViewState?: object }
) => {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container #${containerId} not found`);

    const root = ReactDOM.createRoot(container);
    root.render(
        React.createElement(CromGeoMap, {
            nodes,
            initialViewState: options?.initialViewState
        })
    );

    return root;
};

export { CromGeoMap };
export type { ProjectNode };
