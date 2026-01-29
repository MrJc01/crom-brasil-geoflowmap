import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Copy, Check, ArrowLeft,
    Ship, Shield, Users, Cable, Radio, FileJson, Braces
} from 'lucide-react';
import { CromGeoMap } from '../../lib';
import type { ProjectNode } from '../../lib/types';

// ============================================================================
// EXAMPLE DATA - 5 Practical Examples
// ============================================================================

// Example 1: Global Logistics - Arc Layer (Navigation Routes)
const EXAMPLE_LOGISTICS: ProjectNode[] = [
    {
        id: 'route-1', name: 'Santos → Rotterdam', type: 'item', itemType: 'Arc', visible: true,
        color: [0, 200, 255], targetColor: [100, 255, 200],
        data: { source: [-46.3, -23.9], target: [4.5, 51.9] }
    },
    {
        id: 'route-2', name: 'Santos → Shanghai', type: 'item', itemType: 'Arc', visible: true,
        color: [255, 150, 50], targetColor: [255, 220, 100],
        data: { source: [-46.3, -23.9], target: [121.5, 31.2] }
    },
    {
        id: 'route-3', name: 'Santos → Los Angeles', type: 'item', itemType: 'Arc', visible: true,
        color: [150, 100, 255], targetColor: [200, 150, 255],
        data: { source: [-46.3, -23.9], target: [-118.2, 34.0] }
    },
    {
        id: 'route-4', name: 'Santos → Dubai', type: 'item', itemType: 'Arc', visible: true,
        color: [255, 100, 150], targetColor: [255, 180, 200],
        data: { source: [-46.3, -23.9], target: [55.3, 25.3] }
    },
    {
        id: 'port-santos', name: 'Porto de Santos', type: 'item', itemType: 'Scatterplot', visible: true,
        color: [255, 255, 255], size: 60, shape: 'circle3d', value: 80,
        data: { coordinates: [-46.3, -23.9] }
    }
];

// Example 2: Cyber Attacks - Animated Lines
const EXAMPLE_CYBER: ProjectNode[] = [
    {
        id: 'attack-1', name: 'Russia → BR', type: 'item', itemType: 'Arc', visible: true,
        color: [255, 50, 50], data: { source: [37.6, 55.7], target: [-47.9, -15.8] }
    },
    {
        id: 'attack-2', name: 'China → BR', type: 'item', itemType: 'Arc', visible: true,
        color: [255, 100, 50], data: { source: [116.4, 39.9], target: [-47.9, -15.8] }
    },
    {
        id: 'attack-3', name: 'USA → BR', type: 'item', itemType: 'Arc', visible: true,
        color: [255, 150, 50], data: { source: [-77.0, 38.9], target: [-47.9, -15.8] }
    },
    {
        id: 'attack-4', name: 'Iran → BR', type: 'item', itemType: 'Arc', visible: true,
        color: [255, 80, 80], data: { source: [51.4, 35.7], target: [-47.9, -15.8] }
    },
    {
        id: 'attack-5', name: 'NK → BR', type: 'item', itemType: 'Arc', visible: true,
        color: [255, 30, 30], data: { source: [125.7, 39.0], target: [-47.9, -15.8] }
    },
    {
        id: 'target-br', name: 'Brasil (Target)', type: 'item', itemType: 'Scatterplot', visible: true,
        color: [255, 0, 0], size: 100, shape: 'circle3d', value: 100,
        data: { coordinates: [-47.9, -15.8] }
    }
];

// Example 3: Population Migration - Thick Flow Arrows
const EXAMPLE_MIGRATION: ProjectNode[] = [
    {
        id: 'mig-1', name: 'Venezuela → BR', type: 'item', itemType: 'Arc', visible: true,
        color: [100, 200, 255], width: 8, data: { source: [-66.9, 10.5], target: [-60.0, 2.8] }
    },
    {
        id: 'mig-2', name: 'Haiti → BR', type: 'item', itemType: 'Arc', visible: true,
        color: [150, 180, 255], width: 6, data: { source: [-72.3, 18.5], target: [-46.6, -23.5] }
    },
    {
        id: 'mig-3', name: 'Bolivia → BR', type: 'item', itemType: 'Arc', visible: true,
        color: [180, 160, 255], width: 5, data: { source: [-68.1, -16.5], target: [-46.6, -23.5] }
    },
    {
        id: 'mig-4', name: 'Paraguay → BR', type: 'item', itemType: 'Arc', visible: true,
        color: [200, 140, 255], width: 4, data: { source: [-57.6, -25.3], target: [-49.3, -25.4] }
    },
    {
        id: 'mig-5', name: 'Argentina → BR', type: 'item', itemType: 'Arc', visible: true,
        color: [220, 120, 255], width: 5, data: { source: [-58.4, -34.6], target: [-51.2, -30.0] }
    },
    {
        id: 'city-sp', name: 'São Paulo', type: 'item', itemType: 'Scatterplot', visible: true,
        color: [255, 255, 255], size: 40, data: { coordinates: [-46.6, -23.5] }
    },
    {
        id: 'city-boa', name: 'Boa Vista', type: 'item', itemType: 'Scatterplot', visible: true,
        color: [255, 255, 255], size: 30, data: { coordinates: [-60.0, 2.8] }
    }
];

// Example 4: Submarine Cable Infrastructure - Line Layer
const EXAMPLE_CABLES: ProjectNode[] = [
    {
        id: 'cable-1', name: 'SAm-1 (Miami)', type: 'item', itemType: 'Line', visible: true,
        color: [0, 255, 200], width: 4, data: { source: [-43.2, -22.9], target: [-80.2, 25.8] }
    },
    {
        id: 'cable-2', name: 'Atlantis-2 (EU)', type: 'item', itemType: 'Line', visible: true,
        color: [0, 200, 255], width: 4, data: { source: [-43.2, -22.9], target: [-9.1, 38.7] }
    },
    {
        id: 'cable-3', name: 'SACS (Angola)', type: 'item', itemType: 'Line', visible: true,
        color: [100, 150, 255], width: 4, data: { source: [-25.0, -8.0], target: [13.2, -8.8] }
    },
    {
        id: 'cable-4', name: 'EllaLink (EU)', type: 'item', itemType: 'Line', visible: true,
        color: [150, 100, 255], width: 4, data: { source: [-34.9, -8.0], target: [-16.5, 28.5] }
    },
    {
        id: 'cable-5', name: 'Monet (USA)', type: 'item', itemType: 'Line', visible: true,
        color: [200, 100, 255], width: 4, data: { source: [-46.3, -23.9], target: [-74.0, 40.7] }
    },
    {
        id: 'landing-rj', name: 'Rio de Janeiro', type: 'item', itemType: 'Scatterplot', visible: true,
        color: [0, 255, 200], size: 25, data: { coordinates: [-43.2, -22.9] }
    },
    {
        id: 'landing-for', name: 'Fortaleza', type: 'item', itemType: 'Scatterplot', visible: true,
        color: [0, 255, 200], size: 25, data: { coordinates: [-38.5, -3.7] }
    }
];

// Example 5: 5G Coverage - Scatterplot Heatmap
const generateCityPoints = (): ProjectNode[] => {
    const cities = [
        { name: 'São Paulo', coords: [-46.6, -23.5], intensity: 100 },
        { name: 'Rio de Janeiro', coords: [-43.2, -22.9], intensity: 90 },
        { name: 'Brasília', coords: [-47.9, -15.8], intensity: 85 },
        { name: 'Salvador', coords: [-38.5, -13.0], intensity: 75 },
        { name: 'Fortaleza', coords: [-38.5, -3.7], intensity: 70 },
        { name: 'Belo Horizonte', coords: [-43.9, -19.9], intensity: 80 },
        { name: 'Manaus', coords: [-60.0, -3.1], intensity: 50 },
        { name: 'Curitiba', coords: [-49.3, -25.4], intensity: 75 },
        { name: 'Recife', coords: [-34.9, -8.0], intensity: 72 },
        { name: 'Porto Alegre', coords: [-51.2, -30.0], intensity: 70 },
        { name: 'Goiânia', coords: [-49.3, -16.7], intensity: 65 },
        { name: 'Belém', coords: [-48.5, -1.4], intensity: 55 },
        { name: 'Campinas', coords: [-47.1, -22.9], intensity: 78 },
        { name: 'Florianópolis', coords: [-48.5, -27.6], intensity: 68 },
        { name: 'Vitória', coords: [-40.3, -20.3], intensity: 60 },
    ];

    return cities.map((city, i) => {
        const t = city.intensity / 100;
        const r = Math.round(255 * t);
        const g = Math.round(100 + 155 * (1 - t));
        const b = Math.round(255 * (1 - t));
        return {
            id: `5g-${i}`,
            name: city.name,
            type: 'item' as const,
            itemType: 'Scatterplot' as const,
            visible: true,
            color: [r, g, b] as [number, number, number],
            size: 20 + city.intensity * 0.5,
            shape: 'circle3d' as const,
            value: city.intensity,
            data: { coordinates: city.coords }
        };
    });
};

const EXAMPLE_5G = generateCityPoints();

// ============================================================================
// EXAMPLES CONFIG
// ============================================================================

interface Example {
    id: string;
    title: string;
    description: string;
    icon: typeof Ship;
    nodes: ProjectNode[];
    viewState: {
        longitude: number;
        latitude: number;
        zoom: number;
        pitch: number;
        bearing: number;
    };
    code: string;
}

const EXAMPLES: Example[] = [
    {
        id: 'logistics',
        title: 'Logística Global',
        description: 'Rotas de navegação conectando continentes usando Arc Layer',
        icon: Ship,
        nodes: EXAMPLE_LOGISTICS,
        viewState: { longitude: -20, latitude: 10, zoom: 1.8, pitch: 45, bearing: 0 },
        code: `import { CromGeoMap } from 'crom-geoflowmap';
import type { ProjectNode } from 'crom-geoflowmap';

const routes: ProjectNode[] = [
  {
    id: 'route-1',
    name: 'Santos → Rotterdam',
    type: 'item',
    itemType: 'Arc',
    visible: true,
    color: [0, 200, 255],
    targetColor: [100, 255, 200],
    data: { source: [-46.3, -23.9], target: [4.5, 51.9] }
  },
  // ... mais rotas
];

export default function App() {
  return <CromGeoMap nodes={routes} />;
}`
    },
    {
        id: 'cyber',
        title: 'Ataques Cibernéticos',
        description: 'Linhas animadas convergindo para um ponto central',
        icon: Shield,
        nodes: EXAMPLE_CYBER,
        viewState: { longitude: 20, latitude: 20, zoom: 1.5, pitch: 45, bearing: 20 },
        code: `import { CromGeoMap } from 'crom-geoflowmap';

const attacks: ProjectNode[] = [
  {
    id: 'attack-russia',
    name: 'Russia → Brasil',
    type: 'item',
    itemType: 'Arc',
    visible: true,
    color: [255, 50, 50], // Vermelho para ataques
    data: { source: [37.6, 55.7], target: [-47.9, -15.8] }
  },
  {
    id: 'target',
    name: 'Brasil (Target)',
    type: 'item',
    itemType: 'Scatterplot',
    visible: true,
    color: [255, 0, 0],
    size: 100,
    shape: 'circle3d',
    data: { coordinates: [-47.9, -15.8] }
  }
];`
    },
    {
        id: 'migration',
        title: 'Migração Populacional',
        description: 'Fluxos migratórios com larguras variáveis',
        icon: Users,
        nodes: EXAMPLE_MIGRATION,
        viewState: { longitude: -55, latitude: -10, zoom: 2.5, pitch: 45, bearing: -10 },
        code: `import { CromGeoMap } from 'crom-geoflowmap';

const flows: ProjectNode[] = [
  {
    id: 'flow-venezuela',
    name: 'Venezuela → Brasil',
    type: 'item',
    itemType: 'Arc',
    visible: true,
    color: [100, 200, 255],
    width: 8, // Largura proporcional ao volume
    data: { source: [-66.9, 10.5], target: [-60.0, 2.8] }
  },
  {
    id: 'flow-haiti',
    name: 'Haiti → Brasil',
    type: 'item',
    itemType: 'Arc',
    visible: true,
    color: [150, 180, 255],
    width: 6,
    data: { source: [-72.3, 18.5], target: [-46.6, -23.5] }
  }
];`
    },
    {
        id: 'cables',
        title: 'Cabos Submarinos',
        description: 'Infraestrutura de comunicação usando Line Layer',
        icon: Cable,
        nodes: EXAMPLE_CABLES,
        viewState: { longitude: -30, latitude: 0, zoom: 2, pitch: 30, bearing: 0 },
        code: `import { CromGeoMap } from 'crom-geoflowmap';

const cables: ProjectNode[] = [
  {
    id: 'ellalink',
    name: 'EllaLink (EU)',
    type: 'item',
    itemType: 'Line', // Line Layer para cabos retos
    visible: true,
    color: [150, 100, 255],
    width: 4,
    data: { source: [-34.9, -8.0], target: [-16.5, 28.5] }
  },
  {
    id: 'landing-fortaleza',
    name: 'Fortaleza',
    type: 'item',
    itemType: 'Scatterplot',
    visible: true,
    color: [0, 255, 200],
    size: 25,
    data: { coordinates: [-38.5, -3.7] }
  }
];`
    },
    {
        id: '5g',
        title: 'Cobertura 5G',
        description: 'Pontos com gradiente de cor baseado em intensidade',
        icon: Radio,
        nodes: EXAMPLE_5G,
        viewState: { longitude: -50, latitude: -15, zoom: 3.5, pitch: 50, bearing: 0 },
        code: `import { CromGeoMap } from 'crom-geoflowmap';

// Gerar cor baseada na intensidade do sinal
const getColor = (intensity: number): [number, number, number] => {
  const t = intensity / 100;
  return [
    Math.round(255 * t),       // R: mais vermelho = mais intenso
    Math.round(100 + 155 * (1 - t)), // G
    Math.round(255 * (1 - t))  // B: mais azul = menos intenso
  ];
};

const coverage: ProjectNode[] = [
  {
    id: '5g-sp',
    name: 'São Paulo',
    type: 'item',
    itemType: 'Scatterplot',
    visible: true,
    color: getColor(100), // Intensidade máxima
    size: 70,
    shape: 'circle3d',
    value: 100,
    data: { coordinates: [-46.6, -23.5] }
  }
];`
    }
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function AppDocs() {
    const [activeExample, setActiveExample] = useState<string>('logistics');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [codeTab, setCodeTab] = useState<'json' | 'code'>('json');

    const currentExample = EXAMPLES.find(e => e.id === activeExample)!;

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Generate JSON for current example
    const getExampleJson = () => JSON.stringify(currentExample.nodes, null, 2);

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/10">
                <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <a href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                            Voltar
                        </a>
                        <div className="h-6 w-px bg-white/20" />
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                                <BookOpen size={18} className="text-white" />
                            </div>
                            <span className="text-lg font-semibold text-white">Documentação</span>
                        </div>
                    </div>
                    <a
                        href="/editor.html"
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white text-sm font-medium hover:from-cyan-400 hover:to-blue-500 transition-all"
                    >
                        Abrir Editor
                    </a>
                </div>
            </nav>

            <div className="pt-20 flex">
                {/* Sidebar */}
                <aside className="fixed left-0 top-20 bottom-0 w-72 bg-slate-900/50 border-r border-white/10 overflow-y-auto">
                    <div className="p-6">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            Início Rápido
                        </h3>
                        <ul className="space-y-1 mb-8">
                            <li>
                                <a href="#installation" className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    Instalação
                                </a>
                            </li>
                            <li>
                                <a href="#cdn" className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    CDN
                                </a>
                            </li>
                            <li>
                                <a href="#usage" className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    Uso Básico
                                </a>
                            </li>
                            <li>
                                <a href="#types" className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    Tipos
                                </a>
                            </li>
                        </ul>

                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            Exemplos Práticos
                        </h3>
                        <ul className="space-y-1">
                            {EXAMPLES.map(example => (
                                <li key={example.id}>
                                    <button
                                        onClick={() => setActiveExample(example.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${activeExample === example.id
                                            ? 'bg-cyan-500/20 text-cyan-400'
                                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <example.icon size={18} />
                                        {example.title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="ml-72 flex-1 p-8 overflow-y-auto">
                    <div className="max-w-4xl">
                        {/* Installation Section */}
                        <section id="installation" className="mb-16">
                            <h1 className="text-4xl font-bold text-white mb-4">Instalação</h1>
                            <p className="text-slate-400 text-lg mb-6">
                                Adicione o Crom GeoFlowMap ao seu projeto React.
                            </p>

                            <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-white/10">
                                    <span className="text-slate-400 text-sm font-mono">npm</span>
                                    <button
                                        onClick={() => copyCode('npm install crom-geoflowmap', 'install')}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                                    >
                                        {copiedCode === 'install' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                        {copiedCode === 'install' ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                                <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                                    <span className="text-green-400">$</span> npm install crom-geoflowmap
                                </pre>
                            </div>

                            <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                                <p className="text-cyan-400 text-sm">
                                    <strong>Peer Dependencies:</strong> react, deck.gl, maplibre-gl, react-map-gl
                                </p>
                            </div>
                        </section>

                        {/* CDN Section */}
                        <section id="cdn" className="mb-16">
                            <h2 className="text-3xl font-bold text-white mb-4">CDN</h2>
                            <p className="text-slate-400 text-lg mb-6">
                                Use diretamente via CDN sem precisar de bundler.
                            </p>

                            <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden mb-4">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-white/10">
                                    <span className="text-slate-400 text-sm font-mono">UMD (Browser)</span>
                                    <button
                                        onClick={() => copyCode('https://cdn.jsdelivr.net/npm/crom-geoflowmap/dist/crom-geoflowmap.umd.js', 'cdn-umd')}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                                    >
                                        {copiedCode === 'cdn-umd' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                                    {`<script src="https://cdn.jsdelivr.net/npm/crom-geoflowmap/dist/crom-geoflowmap.umd.js"></script>`}
                                </pre>
                            </div>

                            <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-white/10">
                                    <span className="text-slate-400 text-sm font-mono">ES Module</span>
                                    <button
                                        onClick={() => copyCode('https://cdn.jsdelivr.net/npm/crom-geoflowmap/dist/crom-geoflowmap.es.js', 'cdn-es')}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                                    >
                                        {copiedCode === 'cdn-es' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                                    {`import { CromGeoMap } from 'https://cdn.jsdelivr.net/npm/crom-geoflowmap/dist/crom-geoflowmap.es.js';`}
                                </pre>
                            </div>

                            {/* Standalone - tudo incluso */}
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold text-white mb-3">Standalone (Tudo Incluso)</h3>
                                <p className="text-slate-400 text-sm mb-4">
                                    Use a versão standalone que já inclui React, deck.gl e MapLibre:
                                </p>
                                <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-white/10">
                                        <span className="text-slate-400 text-sm font-mono">HTML Completo</span>
                                        <button
                                            onClick={() => copyCode(`<!DOCTYPE html>
<html>
<head>
  <title>GeoFlowMap Demo</title>
  <style>#map { width: 100vw; height: 100vh; }</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://cdn.jsdelivr.net/npm/crom-geoflowmap/dist-standalone/crom-geoflowmap.standalone.js"></script>
  <script>
    initCromGeoFlowMap('map', [
      {
        id: 'arc-1',
        name: 'São Paulo → New York',
        type: 'item',
        itemType: 'Arc',
        visible: true,
        color: [0, 200, 255],
        data: { source: [-46.6, -23.5], target: [-74.0, 40.7] }
      }
    ]);
  </script>
</body>
</html>`, 'cdn-standalone')}
                                            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                                        >
                                            {copiedCode === 'cdn-standalone' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                                        {`<!DOCTYPE html>
<html>
<head>
  <title>GeoFlowMap Demo</title>
  <style>#map { width: 100vw; height: 100vh; }</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://cdn.jsdelivr.net/npm/crom-geoflowmap/dist-standalone/crom-geoflowmap.standalone.js"></script>
  <script>
    initCromGeoFlowMap('map', [
      {
        id: 'arc-1',
        name: 'São Paulo → New York',
        type: 'item',
        itemType: 'Arc',
        visible: true,
        color: [0, 200, 255],
        data: { source: [-46.6, -23.5], target: [-74.0, 40.7] }
      }
    ]);
  </script>
</body>
</html>`}
                                    </pre>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <p className="text-green-400 text-sm">
                                    <strong>✅ Pronto!</strong> A versão standalone inclui todas as dependências. Basta copiar este HTML e usar.
                                </p>
                            </div>
                        </section>

                        {/* Usage Section */}
                        <section id="usage" className="mb-16">
                            <h2 className="text-3xl font-bold text-white mb-4">Uso Básico</h2>
                            <p className="text-slate-400 text-lg mb-6">
                                Importe o componente e passe um array de nodes para renderizar o mapa.
                            </p>

                            <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden mb-6">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-white/10">
                                    <span className="text-slate-400 text-sm font-mono">App.tsx</span>
                                    <button
                                        onClick={() => copyCode(`import { CromGeoMap } from 'crom-geoflowmap';
import type { ProjectNode } from 'crom-geoflowmap';

const nodes: ProjectNode[] = [
  {
    id: 'arc-1',
    name: 'Rota Principal',
    type: 'item',
    itemType: 'Arc',
    visible: true,
    color: [0, 200, 255],
    data: { source: [-46.6, -23.5], target: [-74.0, 40.7] }
  }
];

export default function App() {
  return <CromGeoMap nodes={nodes} />;
}`, 'usage')}
                                        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                                    >
                                        {copiedCode === 'usage' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                        {copiedCode === 'usage' ? 'Copiado!' : 'Copiar'}
                                    </button>
                                </div>
                                <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                                    {`import { CromGeoMap } from 'crom-geoflowmap';
import type { ProjectNode } from 'crom-geoflowmap';

const nodes: ProjectNode[] = [
  {
    id: 'arc-1',
    name: 'Rota Principal',
    type: 'item',
    itemType: 'Arc',
    visible: true,
    color: [0, 200, 255],
    data: { source: [-46.6, -23.5], target: [-74.0, 40.7] }
  }
];

export default function App() {
  return <CromGeoMap nodes={nodes} />;
}`}
                                </pre>
                            </div>
                        </section>

                        {/* Types Section */}
                        <section id="types" className="mb-16">
                            <h2 className="text-3xl font-bold text-white mb-4">Tipos</h2>
                            <p className="text-slate-400 text-lg mb-6">
                                Referência completa dos tipos disponíveis.
                            </p>

                            <div className="bg-slate-900 rounded-xl border border-white/10 p-6 space-y-4">
                                <div>
                                    <h4 className="text-white font-semibold mb-2">ItemType</h4>
                                    <code className="text-cyan-400 text-sm">'Line' | 'Arc' | 'Scatterplot' | 'GeoJson'</code>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <h4 className="text-white font-semibold mb-2">ProjectNode</h4>
                                    <ul className="text-slate-400 text-sm space-y-1">
                                        <li><code className="text-cyan-400">id</code>: string - Identificador único</li>
                                        <li><code className="text-cyan-400">name</code>: string - Nome exibido no hover</li>
                                        <li><code className="text-cyan-400">type</code>: 'group' | 'item'</li>
                                        <li><code className="text-cyan-400">visible</code>: boolean</li>
                                        <li><code className="text-cyan-400">itemType?</code>: ItemType</li>
                                        <li><code className="text-cyan-400">color?</code>: [r, g, b]</li>
                                        <li><code className="text-cyan-400">targetColor?</code>: [r, g, b] - Cor final (arcos)</li>
                                        <li><code className="text-cyan-400">width?</code>: number - Largura de linhas</li>
                                        <li><code className="text-cyan-400">size?</code>: number - Tamanho de pontos</li>
                                        <li><code className="text-cyan-400">shape?</code>: 'circle2d' | 'square2d' | 'circle3d' | 'square3d'</li>
                                        <li><code className="text-cyan-400">value?</code>: number - Valor para elevação 3D</li>
                                        <li><code className="text-cyan-400">data</code>: {'{ source, target }'} | {'{ coordinates }'}</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Examples Section */}
                        <section id="examples" className="mb-16">
                            <h2 className="text-3xl font-bold text-white mb-4">Exemplos Práticos</h2>
                            <p className="text-slate-400 text-lg mb-6">
                                Explore diferentes casos de uso. Cada exemplo mostra o <strong>JSON</strong> dos dados e o <strong>Código</strong> React.
                            </p>

                            {/* Example Tabs */}
                            <div className="flex gap-2 mb-6 flex-wrap">
                                {EXAMPLES.map(example => (
                                    <button
                                        key={example.id}
                                        onClick={() => setActiveExample(example.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeExample === example.id
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                    >
                                        <example.icon size={16} />
                                        {example.title}
                                    </button>
                                ))}
                            </div>

                            {/* Example Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentExample.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
                                        {/* Map Preview */}
                                        <div className="h-[400px] relative">
                                            <CromGeoMap
                                                nodes={currentExample.nodes}
                                                initialViewState={currentExample.viewState}
                                            />
                                            <div className="absolute top-4 left-4 backdrop-blur-md bg-slate-900/70 rounded-xl px-4 py-3 border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <currentExample.icon size={20} className="text-cyan-400" />
                                                    <div>
                                                        <h4 className="text-white font-semibold">{currentExample.title}</h4>
                                                        <p className="text-slate-400 text-sm">{currentExample.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Code Tabs */}
                                        <div className="border-t border-white/10">
                                            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-white/10">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setCodeTab('json')}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${codeTab === 'json'
                                                            ? 'bg-cyan-500/20 text-cyan-400'
                                                            : 'text-slate-400 hover:text-white'
                                                            }`}
                                                    >
                                                        <FileJson size={16} />
                                                        JSON
                                                    </button>
                                                    <button
                                                        onClick={() => setCodeTab('code')}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${codeTab === 'code'
                                                            ? 'bg-cyan-500/20 text-cyan-400'
                                                            : 'text-slate-400 hover:text-white'
                                                            }`}
                                                    >
                                                        <Braces size={16} />
                                                        Código
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => copyCode(
                                                        codeTab === 'json' ? getExampleJson() : currentExample.code,
                                                        `${currentExample.id}-${codeTab}`
                                                    )}
                                                    className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                                                >
                                                    {copiedCode === `${currentExample.id}-${codeTab}` ? (
                                                        <><Check size={16} className="text-green-400" /> Copiado!</>
                                                    ) : (
                                                        <><Copy size={16} /> Copiar</>
                                                    )}
                                                </button>
                                            </div>

                                            <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto max-h-80">
                                                {codeTab === 'json' ? getExampleJson() : currentExample.code}
                                            </pre>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
