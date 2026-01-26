
export type LayerType = 'Arc' | 'Scatterplot' | 'Line';

export interface LayerConfig {
    id: string;
    label: string;
    type: LayerType;
    visible: boolean;
    color: [number, number, number];
    info?: string; // Markdown content for the layer itself
    data: any;
}

export const LAYERS_CONFIG: LayerConfig[] = [
    {
        id: 'export-soja',
        label: 'Exportação Soja (Agro)',
        type: 'Arc',
        visible: true,
        color: [0, 255, 255],
        info: '# Exportação de Soja\n\nO Brasil é o **maior produtor mundial** de soja. As principais rotas de exportação saem do Mato Grosso e Paraná em direção à China e Europa.\n\n- **Volume Total:** ~100M toneladas\n- **Impacto:** Alto',
        data: [
            {
                source: [-55.42, -12.64],
                target: [116.40, 39.90],
                value: 850,
                product: 'Soja em Grão',
                info: '## Rota MT -> China\n\nEsta é a principal rota comercial do agronegócio brasileiro.\n\n- **Origem:** Sorriso/MT\n- **Destino:** Beijing\n- **Logística:** Multimodal (Caminhão -> Ferrovia -> Navio)'
            },
            {
                source: [-51.92, -24.95],
                target: [121.47, 31.23],
                value: 600,
                product: 'Grãos',
                info: '## Rota PR -> Shanghai\n\nEscoamento via Porto de Paranaguá, referência em eficiência.'
            }
        ]
    },
    {
        id: 'export-tech',
        label: 'Exportação Tecnologia',
        type: 'Arc',
        visible: true,
        color: [180, 0, 255],
        info: '# Setor de Tecnologia\n\nCrescimento exponencial de **SaaS** e **Fintechs** brasileiras com atuação global.',
        data: [
            {
                source: [-46.63, -23.55],
                target: [-122.41, 37.77],
                value: 1200,
                product: 'SaaS / Fintech',
                info: '## SP -> Vale do Silício\n\nConexão direta de startups brasileiras com o ecossistema de inovação global.'
            },
            {
                source: [-48.54, -27.59],
                target: [34.78, 32.08],
                value: 300,
                product: 'Cybersecurity',
                info: '## Floripa -> Tel Aviv\n\nIntercâmbio de tecnologias de segurança avançada.'
            }
        ]
    },
    {
        id: 'cabos-sub',
        label: 'Cabos Submarinos',
        type: 'Line',
        visible: true,
        color: [255, 255, 255],
        info: '# Infraestrutura Digital\n\nCabos submarinos conectam o Brasil diretamente à Europa e EUA, reduzindo latência.',
        data: [
            {
                path: [
                    [-38.50, -3.73],
                    [-37.00, -6.00],
                    [-35.00, -10.00],
                    [-38.00, -18.00],
                    [-40.00, -21.00],
                    [-43.17, -22.90]
                ],
                name: 'Cabo Costeiro Nacional',
                capacity: '40 Tbps',
                info: '## Backbone Atlântico\n\nConecta o Nordeste ao Sudeste garantindo redundância de rede.'
            }
        ]
    },
    {
        id: 'portos',
        label: 'Portos Estratégicos',
        type: 'Scatterplot',
        visible: true,
        color: [255, 200, 0],
        info: '# Portos do Brasil\n\nPontos logísticos estratégicos para o comércio exterior.',
        data: [
            {
                coordinates: [-46.33, -23.96],
                name: "Porto de Santos",
                capacity: "Full",
                info: '## Porto de Santos\n\nO maior complexo portuário da América Latina.\n\n- **Movimentação:** Recorde em contêineres.\n- **Acesso:** Rodovia Anchieta-Imigrantes.'
            },
            { coordinates: [-43.17, -22.90], name: "Porto do Rio", capacity: "High", info: '## Porto do Rio\n\nFocado em cargas de alto valor agregado e off-shore.' },
            { coordinates: [-44.35, -2.55], name: "Porto de Itaqui", capacity: "Medium", info: '## Porto de Itaqui\n\nHub estratégico para o Arco Norte.' }
        ]
    }
];
