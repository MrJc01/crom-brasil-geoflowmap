// Retirado import de ItemType para evitar conflito de values vs types no build (hotfix)
// import { ItemType } from '../types/ProjectTypes';

export type LayerType = 'Arc' | 'Scatterplot' | 'Line' | 'GeoJson';

export interface LayerConfig {
    id: string;
    name: string;
    type: LayerType;
    visible: boolean;
    color: [number, number, number];
    info?: string;
    data: any[];
}

export const LAYERS_CONFIG: LayerConfig[] = [
    {
        id: 'export-soja',
        name: 'Exportação Soja (Arcos)',
        type: 'Arc',
        visible: true,
        color: [0, 255, 255],
        info: '# Exportação de Soja\n\nO Brasil é o **maior produtor mundial** de soja.',
        data: [
            {
                source: [-55.42, -12.64],
                target: [116.40, 39.90],
                value: 850,
                name: 'Rota MT -> China',
                info: '## Rota MT -> China\n\nPrincipal rota comercial do agronegócio.'
            },
            {
                source: [-51.92, -24.95],
                target: [121.47, 31.23],
                value: 600,
                name: 'Rota PR -> Shanghai'
            }
        ]
    },
    {
        id: 'export-tech',
        name: 'Exportação Tecnologia (Arcos)',
        type: 'Arc',
        visible: true,
        color: [180, 0, 255],
        info: '# Setor de Tecnologia\n\nCrescimento de SaaS e Fintechs.',
        data: [
            {
                source: [-46.63, -23.55],
                target: [-122.41, 37.77],
                value: 1200,
                name: 'SP -> Vale do Silício'
            }
        ]
    },
    {
        id: 'cabos-sub',
        name: 'Conexão Digital (Linha)',
        type: 'Line',
        visible: true,
        color: [255, 255, 255],
        info: '# Infraestrutura Digital',
        data: [
            {
                source: [-38.50, -3.73], // Fortaleza
                target: [-43.17, -22.90], // Rio
                name: 'Cabo Costeiro Nacional',
                value: 40
            }
        ]
    },
    {
        id: 'portos',
        name: 'Portos Estratégicos (Pontos)',
        type: 'Scatterplot',
        visible: true,
        color: [255, 200, 0],
        info: '# Portos do Brasil',
        data: [
            {
                coordinates: [-46.33, -23.96],
                name: "Porto de Santos",
                value: 100
            },
            {
                coordinates: [-43.17, -22.90],
                name: "Porto do Rio",
                value: 80
            }
        ]
    }
];
