export interface IRowEvent<T = any> {
    action: string;
    data: T;
}