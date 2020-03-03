export interface IDataSet {
    /**
     * Getter
     */
    get(field: string): number | string;

    /**
     * Return list of attributes
     */
    getAttributes(): string[];
}
