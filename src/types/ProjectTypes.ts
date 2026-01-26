
export type NodeType = 'group' | 'item';
export type ItemType = 'Line' | 'Arc' | 'Scatterplot' | 'GeoJson';

export interface ProjectNode {
    id: string;
    name: string; // Used to be label
    type: NodeType;
    visible: boolean;
    children?: ProjectNode[]; // For groups

    // Item Specifics
    itemType?: ItemType;
    color?: [number, number, number];
    targetColor?: [number, number, number];
    appearance?: {
        type?: 'solid' | 'dashed';
        colorType?: 'solid' | 'gradient';
        dash?: [number, number];
    };
    width?: number;
    data?: any;
    info?: string;
}
