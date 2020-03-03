import { IDataSet } from "../controller/IDataSet";
import { Decimal } from "decimal.js";
import { error } from "util";
import Log from "../Util";

export class TransformationsFilter {
    /**
     * Transform list of dataset based by GROUP and APPLY
     */
    public filter(listOfDataSet: object[], query: any): object[] {
        // Log.info("TransformationsFilter :: 1");
        let groupedList: object[][] = this.group(listOfDataSet, query);
        // // Log.info("-----------------------------------");
        // // Log.info(groupedList);
        // // Log.info("-----------------------------------");
        // Log.info("TransformationsFilter :: 2");
        let appliedList: object[] = this.apply(groupedList, query);
        // // Log.info(appliedList);
        // Log.info("TransformationsFilter :: 3");
        // // Log.info(appliedList);
        return appliedList;
    }

    /**
     * Group list of dataset based on elements of group
     */
    public group(listOfDataSet: object[], query: any): object[][] {
        // // Log.info("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        // // Log.info(listOfDataSet);
        // // Log.info("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        let loloDataSet: object[][] = [listOfDataSet];
        // let nextGroup: IDataSet[][] = this.splitToGroup(loloDataSet, "courses_dept");
        // let group: string[] = this.getGroup(query);
        let group: string[] = query.TRANSFORMATIONS.GROUP;
        for (let key of group) {
            loloDataSet = this.splitToGroup(loloDataSet, key);
        }
        // // Log.info(loloDataSet);
        // // Log.info(group);

        return loloDataSet;
    }

    /**
     * Apply features to grouped list of dataset
     */
    private apply(groupedList: object[][], query: any): object[] {
        // // Log.info("TransformationsFilter :: apply :: before apply");
        let loApply = query.TRANSFORMATIONS.APPLY;
        if (loApply.length === 0) {
            return this.appliedListWithNoApply(groupedList);
        }
        // // Log.info(loApply);
        // // Log.info("TransformationsFilter :: apply :: 1");
        // // Log.info(loApply);
        let appliedList: object[] = [];
        for (let loDataSet of groupedList) {
            let dataSetObj: any = loDataSet[0];
            // let listOfAttribute: string[] = loDataSet[0].;
            // for (let attr of listOfAttribute) {
            //     dataSetObj[attr] = loDataSet[0].get(attr);
            // }
            for (let applyElm of loApply) {
                let applyNum: number = this.generateNumber(loDataSet, applyElm);
                // // Log.info(applyNum);
                this.updateDataSet(dataSetObj, applyElm, applyNum);
            }
            appliedList.push(dataSetObj);
        }

        // // Log.info("TransformationsFilter :: apply :: after apply");
        Log.info("appliedList");
        Log.info(appliedList);
        return appliedList;
    }

    /**
     * Return applied list with no reply
     */
    private appliedListWithNoApply(groupedList: object[][]): object[] {
        let appliedList: object[] = [];
        for (let loDataSet of groupedList) {
            appliedList.push(loDataSet[0]);
        }
        return appliedList;
    }

    /**
     * Update dataSetObj with apply key
     */
    private updateDataSet(dataSetObj: any, applyElm: any, applyNum: number): object {
        // overallAvg
        let outerKey: string = this.NthKey(applyElm, 0);
        dataSetObj[outerKey] = applyNum;

        return dataSetObj;
    }

    /**
     * Generate number based on given apply property and dataset
     */
    private generateNumber(loDataSet: any[], applyElm: any): number {
        // overallAvg
        let outerKey = this.NthKey(applyElm, 0);
        // { AVG: 'courses_avg' }
        let outerValue = this.valueOfNthKey(applyElm, 0);
        // AVG
        let innerKey = this.NthKey(outerValue, 0);
        // courses_avg
        let innerValue = this.valueOfNthKey(outerValue, 0);
        let field = this.getField(innerValue);

        if (innerKey === "MAX") {
            let max = -Infinity;
            for (let dataSet of loDataSet) {
                max = Math.max(Number(dataSet[field]), max);
            }
            return max;
        }
        if (innerKey === "MIN") {
            let min = Infinity;
            for (let dataSet of loDataSet) {
                min = Math.min(Number(dataSet[field]), min);
            }
            return min;
        }

        if (innerKey === "AVG") {
            let count = loDataSet.length;
            let total = new Decimal(0);
            for (let dataSet of loDataSet) {
                // // Log.info("n: " + (dataSet.get(field)));
                total = total.add(new Decimal(dataSet[field]));
            }
            // // Log.info("total: " + total);
            let avg = total.toNumber() / count;
            // // Log.info("avg: " + avg);
            let result = Number(avg.toFixed(2));
            return result;
        }

        if (innerKey === "COUNT") {
            let numberSet: Set<number | string> = new Set<number | string>();
            for (let dataSet of loDataSet) {
                numberSet.add(dataSet[field]);
            }
            return numberSet.size;
        }

        if (innerKey === "SUM") {
            let sum = new Decimal(0);
            for (let dataSet of loDataSet) {
                sum = sum.add(dataSet[field]);
            }
            let result = Number(sum.toFixed(2));
            return result;
        }
        error("Should not have reached here! TransformationFilter :: generateNumber");
        return null;
    }

    private splitToGroup(loloDataSet: any[][], groupValue: string): IDataSet[][] {
        const field = this.getField(groupValue);
        // // Log.info("field: " + field);
        let listOfGroupedDataSet: IDataSet[][] = [];
        for (let loDataSet of loloDataSet) {
            // if dataset has key field
            let mapByField = new Map<string, IDataSet[]>();
            for (let dataset of loDataSet) {
                if (mapByField.has(String(dataset[field]))) {
                    let updatedList = mapByField.get(
                        String(dataset[field]),
                    );
                    updatedList.push(dataset);
                    mapByField.set(String(dataset[field]), updatedList);
                } else {
                    let listOfDataSet: IDataSet[] = [dataset];
                    mapByField.set(String(dataset[field]), listOfDataSet);
                }
            }
            for (let values of mapByField.values()) {
                listOfGroupedDataSet.push(values);
            }
        }
        return listOfGroupedDataSet;
    }

    /**
     * Return value of key at index in obj
     */
    private valueOfNthKey(obj: any, index: number): any {
        return obj[Object.keys(obj)[index]];
    }

    /**
     * Return field of key
     */
    private getField(key: string): string {
        return key.split("_")[1];
    }

    /**
     * Return key at index of obj
     */
    private NthKey(obj: any, index: number): string {
        return Object.keys(obj)[index];
    }
}
