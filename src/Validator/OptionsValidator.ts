import Log from "../Util";
import {InsightError} from "../controller/IInsightFacade";

export class OptionsValidator {
    private columnKeys: any[];
    private sortKeys: any[];
    // check for duplicate IdString
    public constructor() {
        this.columnKeys = [];
        this.sortKeys = [];
    }

    /**
     * validateWhere
     */
    public validateOptions(query: any): Promise<any> {
        if (!(this.isValidQueryStructure(query, 1, false) || this.isValidQueryStructure(query, 2, false))) {
            return Promise.reject(new InsightError("options structure error"));
        }
        if (!this.isValidObjKey(query, 0, "COLUMNS")) {
            return Promise.reject(new InsightError("Options key error"));
        }
        return this.validateColumnObj(query.COLUMNS).then(() => {
            if (Object.keys(query).length === 2) {
                if (!this.isValidObjKey(query, 1, "ORDER")) {
                    return Promise.reject(new InsightError("sort key error"));
                }
                return this.validateOptionsObj(query.ORDER);
            } else {
                return Promise.resolve();
            }
        }).catch(function (err) {
            return Promise.reject(err);
        });
    }

    /**
     * If value of the key at index of obj is matchString,
     * then return resolved Promise, otherwise return rejected Promise
     */
    private isValidObjKey(obj: any, index: number, matchString: string): boolean {
        if (Object.keys(obj)[index] !== matchString) {
            return false;
        }
        return true;
    }

    public getColumnKeys() {
        return this.columnKeys;
    }

    private isValidQueryStructure(query: any, numObj: number, isArray: boolean) {
        if (query === undefined || query === null || typeof query !== "object") {
            return false;
        }
        if (isArray) {
            if (query.length < 1 || Array.isArray(query) !== isArray) {
                return false;
            }
        } else {
            if  (Object.keys(query).length !== numObj) {
                return false;
            }
        }
        return true;
    }

    private validateColumnObj(columns: any[]): Promise<any> {
        if (!this.isValidQueryStructure(columns, 1, true)) {
            return Promise.reject(new InsightError("Columns invalid object"));
        }
        for (let key of columns) {
            this.columnKeys.push(key);
        }
        return Promise.resolve();
    }


    private validateOptionsObj(order: any): Promise<any> {
        if (!(this.validateDirOrder(order) || this.validateNoDirOrder(order))) {
            return Promise.reject(new InsightError("invalid order object"));
        }
        for (let key of this.sortKeys) {
            if (!this.columnKeys.includes(key)) {
                return Promise.reject(new InsightError("sort key not in column key"));
            }
        }
        return Promise.resolve();
    }

    private validateDirOrder(order: any): boolean {
        if (!this.isValidQueryStructure(order, 2, false)) {
            return false;
        }
        if (!this.isValidObjKey(order, 0, "dir") && !this.isValidObjKey(order, 1, "keys")) {
            return false;
        }
        if (!(order.dir === "UP" || order.dir === "DOWN")) {
            return false;
        }
        if (!this.isValidQueryStructure(order.keys, 1, true)) {
            return false;
        }
        for (let orderkey of order.keys) {
            this.sortKeys.push(orderkey);
        }
        return true;
    }

    private validateNoDirOrder(order: any): boolean {
        if (typeof order !== "string") {
            return false;
        }
        this.sortKeys.push(order);
        return true;
    }
}
