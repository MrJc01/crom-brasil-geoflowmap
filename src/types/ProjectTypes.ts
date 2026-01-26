
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
    data?: any;
    info?: string;
}
