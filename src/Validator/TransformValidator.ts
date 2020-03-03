import {InsightError} from "../controller/IInsightFacade";
import Log from "../Util";

export class TransformValidator {
    private groupKeys: any[];
    private mKeys: any[];
    private anyKeys: any[];
    private applyKeys: any[];

    constructor() {
        this.groupKeys = [];
        this.mKeys = [];
        this.anyKeys = [];
        this.applyKeys = [];
    }

    // Validate tranform object of query. If the object doesn't have exactly 2 objects, return false. Otherwise check
    // both group and apply
    public validateTransform(query: any): Promise<any> {
        if (query === undefined) {
            return Promise.resolve();
        }
        if (Object.keys(query).length !== 2 || Array.isArray(query) || typeof query !== "object") {
            return Promise.reject(new InsightError("Transformation structure error"));
        }
        if (!(this.isValidObjKey(query, 0, "GROUP") && this.isValidObjKey(query, 1, "APPLY"))) {
            return Promise.reject(new InsightError("invalid group and apply keys"));
        }
        if (this.validateGroup(query.GROUP) && this.validateApply(query.APPLY)) {
            return Promise.resolve();
        }
        return Promise.reject(new InsightError("Invalid group or apply keys"));
    }

    private isValidObjKey(obj: any, index: number, matchString: string): boolean {
        if (Object.keys(obj)[index] !== matchString) {
            Log.info("Invalid object key");
            return false;
        }
        return true;
    }

    // Validate group object. If there is no group object, return false. If the group object is not an array
    // return false. If group object is an array, then push the keys onto the keys array;
    private validateGroup(group: any): boolean {
        if (!this.isValidQueryStructure(group, 1, true)) {
            return false;
        }
        for (const member of group) {
            this.groupKeys.push(member);
        }
        return true;
    }

    // Validate apply object. If there is no apply object, return false. Return true if apply object is an array and all
    // apply rules are valid. Return false otherwise.
    private validateApply(apply: any): boolean {
        if (apply.length === 0) {
            return true;
        }
        if (!this.isValidQueryStructure(apply, 1, true)) {
            return false;
        }
        for (const applyrule of apply) {
            if (!this.validateApplyRule(applyrule)) {
                return false;
            }
        }
        return true;
    }

    // Validate apply rule.
    private validateApplyRule(applyrule: any): boolean {
        if (!this.isValidQueryStructure(applyrule, 1, false)) {
            return false;
        }
        let applykey = Object.keys(applyrule)[0];
        if (applykey.split("_").length > 1 || applykey === "" || typeof applykey !== "string") {
            return false;
        }
        if (!this.applyKeys.includes(applykey) && this.validateEachRule(applyrule[applykey])) {
            this.applyKeys.push(applykey);
            return true;
        }
        return false;
    }

    // Validate applytoken: key
    private validateEachRule(applyrule: any): boolean {
        if (!this.isValidQueryStructure(applyrule, 1, false)) {
            return false;
        }
        let applyToken = Object.keys(applyrule)[0];
        let key = Object.values(applyrule)[0];
        if (applyToken.match(/^(MIN|MAX|AVG|SUM)$/)) {
            this.mKeys.push(key);
            return true;
        } else if (applyToken === "COUNT") {
            this.anyKeys.push(key);
            return true;
        }
        return false;
    }

    public getGroupKeys() {
        return this.groupKeys;
    }

    public getmKeys() {
        return this.mKeys;
    }

    // Any key is the key of applytoken "count"
    public getAnyKeys() {
        return this.anyKeys;
    }

    public getApplyKeys() {
        return this.applyKeys;
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
}
