export interface IHeader {
    title: string,
    key: string,
    width?: number,
    sortable?: boolean,
    asc?: boolean,
    dynamicCellComponent?: any,
    className?: string,
    visible?: boolean;
    valueFormatter?: (value: any, row?: any) => any;
}