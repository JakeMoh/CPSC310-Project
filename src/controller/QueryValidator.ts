import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import {WhereValidator} from "../Validator/WhereValidator";
import {OptionsValidator} from "../Validator/OptionsValidator";
import {TransformValidator} from "../Validator/TransformValidator";

const fs = require("fs");
export class QueryValidator {
    private courseSfield: string[] = ["dept", "id", "instructor", "title", "uuid"];
    private courseMfield: string[] = ["avg", "pass", "fail", "audit", "year"];
    private roomSfield: string[] = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
    private roomMfield: string[] = ["lat", "lon", "seats"];
    private mKeys: any[];
    private sKeys: any[];
    private keys: any[];
    private columnKeys: any[];
    private groupKeys: any[];
    private applyKeys: any[];
    private listDataset: InsightDataset[];
    private whereValidator: WhereValidator;
    private optionsValidator: OptionsValidator;
    private transformValidator: TransformValidator;
    public constructor(addedDataset: InsightDataset[]) {
        this.listDataset = addedDataset;
        this.whereValidator = new WhereValidator();
        this.optionsValidator = new OptionsValidator();
        this.transformValidator = new TransformValidator();
        this.mKeys = [];
        this.sKeys = [];
        this.keys = [];
        this.columnKeys = [];
        this.applyKeys = [];
    }

    /**
     * If query is valid, then return resolved Promise, otherwise return rejected Promise
     */
    public validateQuery(query: any): Promise<any> {
        if (Array.isArray(query) || typeof query !== "object" || query === null || query === undefined) {
            return Promise.reject(new InsightError("query should not be an array"));
        }
        let keyList = Object.keys(query);
        if (keyList.length < 2 || keyList[0] !== "WHERE" && keyList[1] !== "OPTIONS" || keyList.length > 3) {
            return Promise.reject(new InsightError("query should not be an array"));
        }
        if (keyList.length === 3 && keyList[2] !== "TRANSFORMATIONS") {
            return Promise.reject(new InsightError("query third key is not transformations"));
        }
        return new Promise((resolve, reject) => {
            resolve(this.whereValidator.validateWhere(query.WHERE));
        }).then(() => {
            return this.optionsValidator.validateOptions(query.OPTIONS);
        }).then(() => {
            return this.transformValidator.validateTransform(query.TRANSFORMATIONS);
        }).then(() => {
            this.aggregateAllKeys();
            if (this.groupKeys.length === 0) {
                this.addColumnKeys();
                return Promise.resolve();
            } else {
                return this.validateColumnKeys();
            }
        }).then(() => {
            if (this.validateMKeyArray() && this.validateSKeyArray()) {
                return Promise.resolve(this.validateAllKeys(this.keys));
            } else {
                return Promise.reject(new InsightError("key field error"));
            }
        }).catch(function (err) {
            return Promise.reject(err);
        });
    }

    // keys = all keys - (column keys & apply keys)
    private aggregateAllKeys() {
        this.mKeys = this.whereValidator.getmKey().concat(this.transformValidator.getmKeys());
        this.sKeys = this.whereValidator.getsKey();
        this.columnKeys = this.optionsValidator.getColumnKeys();
        this.applyKeys = this.transformValidator.getApplyKeys();
        this.groupKeys = this.transformValidator.getGroupKeys();
        this.keys = this.mKeys.concat(this.sKeys, this.groupKeys, this.transformValidator.getAnyKeys());
        // Log.info("keys: " + this.keys);
        // Log.info("skeys: " + this.sKeys);
        // Log.info("mkeys: " + this.mKeys);
        // Log.info("columnkeys: " + this.columnKeys);
        // Log.info("groupkeys: " + this.groupKeys);
        // Log.info("applykeys: " + this.applyKeys);
    }

    private validateMKeyArray(): boolean {
        if (this.mKeys.length === 0) {
            return true;
        }
        for (let key of this.mKeys) {
            let keySet = key.split("_");
            let mKey = keySet[1];
            if (![...this.roomMfield, ...this.courseMfield].includes(mKey)) {
                return false;
            }
        }
        return true;
    }

    private validateSKeyArray(): boolean {
        if (this.sKeys.length === 0) {
            return true;
        }
        for (let key of this.sKeys) {
            let keySet = key.split("_");
            let sKey = keySet[1];
            if (![...this.roomSfield, ...this.courseSfield].includes(sKey)) {
                return false;
            }
        }
        return true;
    }

    private validateAllKeys(keys: any[]): Promise<any> {
        if (keys.length === 0) {
            return Promise.resolve();
        }
        if (typeof keys[0] !== "string") {
            return Promise.reject(new InsightError("key is not a string"));
        }
        let fileProperty: InsightDataset = null;
        let firstIdString = keys[0].split("_")[0];
        let datasetKind: InsightDatasetKind = null;
        for (let dataset of this.listDataset) {
            if (dataset.id === firstIdString) {
                datasetKind = dataset.kind;
                fileProperty = dataset;
            }
        }
        if (datasetKind === null) {
            return Promise.reject(new InsightError("idString not found in addedDataset"));
        }
        for (let key of keys) {
            if (typeof key !== "string") {
                return Promise.reject(new InsightError("key is not a string"));
            }
            let keySet = key.split("_");
            let idString = keySet[0];
            let fieldValue = keySet[1];
            if (keySet.length !== 2 || idString !== firstIdString) {
                return Promise.reject(new InsightError("query key error"));
            }
            if (datasetKind === InsightDatasetKind.Courses) {
                if (![...this.courseMfield, ...this.courseSfield].includes(fieldValue)) {
                    return Promise.reject(new InsightError("Incorrect fields"));
                }
            } else if (datasetKind === InsightDatasetKind.Rooms) {
                if (![...this.roomMfield, ...this.roomSfield].includes(fieldValue)) {
                    return Promise.reject(new InsightError("Incorrect fields"));
                }
            }
        }
        return Promise.resolve(fileProperty);
    }

    private validateColumnKeys(): Promise<any> {
        for (let key of this.columnKeys) {
            if (![...this.groupKeys, ...this.applyKeys].includes(key)) {
                return Promise.reject(new InsightError("column key is not in group key"));
            }
        }
        Promise.resolve();
    }

    private addColumnKeys() {
        this.keys = this.keys.concat(this.columnKeys);
    }
}
