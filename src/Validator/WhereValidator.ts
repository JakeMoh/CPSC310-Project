import Log from "../Util";
import {InsightError} from "../controller/IInsightFacade";

export class WhereValidator {
    private sKey: any[];
    private mKey: any[];
    public constructor() {
        this.sKey = [];
        this.mKey = [];
    }

    /**
     * validateWhere
     */
    public validateWhere(query: any): Promise<any> {
        if (query === undefined || query === null || Array.isArray(query) || typeof query !== "object") {
            return Promise.reject(new InsightError());
        }
        return this.checkInvalidFilterKeyRecursion(query).catch(function (err) {
            return Promise.reject(err);
        });
    }

    /**
     * If value of "WHERE" key is empty and is valid FILTER, then return resolved Promise,
     * otherwise return rejected Promise
     */
    public checkInvalidFilterKeyRecursion(valueOfWHERE: any): Promise<any> {
        if (Object.keys(valueOfWHERE).length === 0 || this.isValidFilter(valueOfWHERE)) {
            return Promise.resolve();
        } else {
            Log.info("Rejected Promise: checkInvalidFilterKeyRecursion");
            return Promise.reject(new InsightError("isValidFilterKey Error"));
        }
    }

    public isValidFilter(filter: any): any {
        // filter should be an object with one key
        if (!this.checkInvalidObject(filter, 1)) {
            Log.info("Invalid filter: isValidFilter :: 1");
            return false;
        }
        // keyInFilter example: "LT", "EQ", "GT", "IS", "AND", "OR", "NOT"
        let keyInFilter: string = this.NthKey(filter, 0);
        // if keyInFilter is one of "LT" , "EQ", "GT", "IS"
        if (keyInFilter.match(/^(LT|GT|EQ|IS)$/)) {
            // valueOfLtEqGtIs example: {"courses_avg": 95}
            let valueOfLtEqGtIs = filter[keyInFilter];
            // valueOfLtEqGtIs should be an object with one key
            if (!this.checkInvalidObject(valueOfLtEqGtIs, 1)) {
                Log.info("Invalid filter: isValidFilter :: 3");
                return false;
            }
            // key example: "course_avg"
            let key = this.NthKey(valueOfLtEqGtIs, 0);
            // value example: 95
            let value = valueOfLtEqGtIs[key];
            if (keyInFilter === "IS") {
                // check key and value of IS value
                if (!this.checkIs(value)) {
                    Log.info("Invalid filter: isValidFilter :: 5");
                    return false;
                }
                this.sKey.push(key);
            }
            if (keyInFilter === "LT" || keyInFilter === "EQ" || keyInFilter === "GT") {
                // check key and value of LtEqGt value
                if (!this.checkLtEqGt(value)) {
                    Log.info("Invalid filter: isValidFilter :: 6");
                    return false;
                }
                this.mKey.push(key);
            }
        } else if (keyInFilter === "AND" || keyInFilter === "OR") {
            // value of "AND" and "OR" should be an non-empty array
            if (!Array.isArray(filter[keyInFilter]) || filter[keyInFilter].length === 0) {
                return false;
            }
            // recursion: if at least one filter fails the whole function fails
            let acc = true;
            for (const value of filter[keyInFilter]) {
                acc = acc && this.isValidFilter(value);
            }
            return acc;
        } else if (keyInFilter === "NOT") {
            if (filter["NOT"] === null || filter["NOT"] === undefined || Object.keys(filter["NOT"]).length !== 1 ||
            Array.isArray(filter)) {
                return false;
            }
            // another recursive call
            return this.isValidFilter(filter["NOT"]);
        } else {
            return false;
        }
        return true;
    }

    /**
     * If input is an object with exactly numberOfElm elements, then return true, otherwise return false
     */
    public checkInvalidObject(input: any, numberOfElm: number): boolean {
        if (input === undefined || input === null || typeof input !== "object" || Array.isArray(input)) {
            return false;
        }
        if (Object.keys(input).length !== numberOfElm && numberOfElm !== null) {
            return false;
        }
        return true;
    }

    /**
     * Return key at index of obj
     */
    public NthKey(obj: any, index: number): string {
        return Object.keys(obj)[index];
    }

    /**
     * If key and value of IS is valid, then return true, otherwise return false
     */
    public checkIs(value: string): boolean {
        if (typeof value !== "string" || value.split("*").length > 3) {
            return false;
        } else {
            return /^[*]?[^*]*[*]?$/.test(value);
        }
    }

    /**
     * If key and value of LtEqGt is valid, return true, otherwise return false
     */
    public checkLtEqGt(value: string): boolean {
        if (typeof value !== "number") {
            Log.info("Invalid filter: checkLtEqGt :: 3");
            return false;
        }
        return true;
    }

    public getmKey() {
        return this.mKey;
    }

    public getsKey() {
        return this.sKey;
    }
}
