import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Code, Layers, Zap, ArrowRight, Github, BookOpen, Edit3 } from 'lucide-react';
import { CromGeoMap } from '../../lib';
import type { ProjectNode } from '../../lib/types';

// Demo data for background visualization
const DEMO_NODES: ProjectNode[] = [
    {
        id: 'demo-arc-1',
        name: 'SP → NY',
        type: 'item',
        itemType: 'Arc',
        visible: true,
        color: [0, 200, 255],
        data: { source: [-46.6, -23.5], target: [-74.0, 40.7] }
    },
    {
        id: 'demo-arc-2',
        name: 'SP → LDN',
        type: 'item',
        itemType: 'Arc',
        visible: true,
        color: [255, 100, 150],
        data: { source: [-46.6, -23.5], target: [-0.1, 51.5] }
    },
    {
        id: 'demo-arc-3',
        name: 'SP → TKY',
        type: 'item',
        itemType: 'Arc',
        visible: true,
        color: [100, 255, 200],
        data: { source: [-46.6, -23.5], target: [139.7, 35.7] }
    },
    {
        id: 'demo-arc-4',
        name: 'RJ → Paris',
        type: 'item',
        itemType: 'Arc',
        visible: true,
        color: [255, 200, 50],
        data: { source: [-43.2, -22.9], target: [2.3, 48.9] }
    },
    {
        id: 'demo-point-1',
        name: 'São Paulo',
        type: 'item',
        itemType: 'Scatterplot',
        visible: true,
        color: [255, 255, 255],
        size: 50,
        data: { coordinates: [-46.6, -23.5] }
    }
];

const features = [
    {
        icon: Code,
        title: 'JSON-Driven',
        description: 'Configure visualizações complexas através de simples objetos JSON. Perfeito para integração com APIs.'
    },
    {
        icon: Layers,
        title: 'Múltiplas Camadas',
        description: 'Suporte a Arcs, Lines, Scatterplots e muito mais. Combine diferentes tipos de dados.'
    },
    {
        icon: Globe,
        title: 'Visualização 3D',
        description: 'Mapas interativos com suporte a pitch, bearing e elevação. Renderização WebGL de alta performance.'
    },
    {
        icon: Zap,
        title: 'Alta Performance',
        description: 'Construído com deck.gl e MapLibre para renderizar milhares de pontos sem perda de performance.'
    }
];

export default function AppLanding() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950">
            {/* Background Map */}
            <div className="absolute inset-0 z-0 opacity-40">
                <CromGeoMap
                    nodes={DEMO_NODES}
                    initialViewState={{
                        longitude: -40,
                        latitude: 0,
                        zoom: 2,
                        pitch: 45,
                        bearing: -20
                    }}
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />

            {/* Content */}
            <div className="relative z-20">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-50">
                    <div className="mx-auto max-w-7xl px-6 py-4">
                        <div className="flex items-center justify-between backdrop-blur-md bg-slate-900/50 rounded-2xl px-6 py-3 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                                    <Globe size={24} className="text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">Crom GeoFlowMap</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <a
                                    href="/docs.html"
                                    className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    <BookOpen size={18} />
                                    Docs
                                </a>
                                <a
                                    href="/editor.html"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25"
                                >
                                    <Edit3 size={18} />
                                    Editor
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center px-6 pt-24">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-8">
                                <Zap size={14} />
                                Open Source • React • deck.gl
                            </span>

                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                Visualize Fluxos
                                <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                    Geográficos em 3D
                                </span>
                            </h1>

                            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Componente React para visualização de dados geográficos interativos.
                                Renderize arcos, linhas e pontos com configuração JSON simples.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href="/editor.html"
                                    className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50"
                                >
                                    Abrir Editor
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </a>
                                <a
                                    href="/docs.html"
                                    className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-white/10 transition-all"
                                >
                                    <BookOpen size={20} />
                                    Ver Documentação
                                </a>
                            </div>
                        </motion.div>

                        {/* Code Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="mt-16"
                        >
                            <div className="backdrop-blur-xl bg-slate-900/70 rounded-2xl border border-white/10 p-6 text-left max-w-2xl mx-auto shadow-2xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <span className="ml-4 text-slate-500 text-sm font-mono">App.tsx</span>
                                </div>
                                <pre className="text-sm font-mono overflow-x-auto">
                                    <code>
                                        <span className="text-purple-400">import</span>
                                        <span className="text-slate-300"> {'{ CromGeoMap }'} </span>
                                        <span className="text-purple-400">from</span>
                                        <span className="text-green-400"> '@crom/geoflowmap'</span>
                                        <span className="text-slate-500">;</span>
                                        {'\n\n'}
                                        <span className="text-slate-500">{'// Renderize arcos 3D com uma linha de código'}</span>
                                        {'\n'}
                                        <span className="text-purple-400">{'<'}</span>
                                        <span className="text-cyan-400">CromGeoMap</span>
                                        <span className="text-slate-300"> nodes</span>
                                        <span className="text-purple-400">=</span>
                                        <span className="text-slate-300">{'{projectData}'}</span>
                                        <span className="text-purple-400">{' />'}</span>
                                    </code>
                                </pre>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-32 px-6">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl font-bold text-white mb-4">
                                Recursos Poderosos
                            </h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                Tudo que você precisa para criar visualizações geográficas impressionantes
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group p-6 backdrop-blur-xl bg-slate-900/50 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4 group-hover:from-cyan-500/30 group-hover:to-blue-600/30 transition-all">
                                        <feature.icon size={24} className="text-cyan-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 px-6">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-3xl border border-white/10 p-12 text-center"
                        >
                            <h2 className="text-4xl font-bold text-white mb-4">
                                Pronto para Começar?
                            </h2>
                            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                                Experimente o editor visual ou integre diretamente em seu projeto React
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href="/editor.html"
                                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25"
                                >
                                    <Edit3 size={20} />
                                    Abrir Editor
                                </a>
                                <a
                                    href="https://github.com/crom-brasil/geoflowmap"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/20 rounded-2xl text-white font-semibold hover:bg-white/10 transition-all"
                                >
                                    <Github size={20} />
                                    GitHub
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 px-6 border-t border-white/10">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                                <Globe size={18} className="text-white" />
                            </div>
                            <span className="text-slate-400">Crom GeoFlowMap</span>
                        </div>
                        <p className="text-slate-500 text-sm">
                            © 2024 Crom Brasil. Open Source under MIT License.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
