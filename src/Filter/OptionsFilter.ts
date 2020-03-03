import { IDataSet } from "../controller/IDataSet";
import Log from "../Util";

export class OptionsFilter {
    public filter(listOfDataSet: object[], query: any): object[] {
        let columnedLoDataSet: object[] = [];
        if (Object.keys(query.OPTIONS).length === 1) {
            for (let dataObj of listOfDataSet) {
                columnedLoDataSet.push(this.createDatasetObj(dataObj, query));
            }
            return columnedLoDataSet;
        }
        // Log.info("OptionsFilter :: filter :: 1");
        // // Log.info("listOfDataSet");
        // // Log.info(listOfDataSet);
        let concatListOfDataSet: object[];
        if (typeof query.OPTIONS.ORDER === "object") {
            // Log.info("Has advanced order");
            concatListOfDataSet = this.advancedOrder(listOfDataSet, query);
        } else {
            // Log.info("Has normal order");
            concatListOfDataSet = [];
            let concatloloDataSet: object[][];
            concatloloDataSet = this.splitByOrder([listOfDataSet], query.OPTIONS.ORDER, true);
            // Log.info(concatloloDataSet);
            for (let loDataSet of concatloloDataSet) {
                concatListOfDataSet = concatListOfDataSet.concat(loDataSet);
            }
            // Log.info(concatListOfDataSet);
        }
        // Log.info("OptionsFilter :: filter :: 4");
        // // Log.info("concatListOfDataSet");
        // // Log.info(concatListOfDataSet);
        // // Log.info("@@@@@ updatedListOfDataSet @@@@@: ");
        // // Log.info(updatedListOfDataSet);

        for (let dataObj of concatListOfDataSet) {
            columnedLoDataSet.push(this.createDatasetObj(dataObj, query));
        }
        // Log.info("OptionsFilter :: filter :: 5");
        // // Log.info("columnedLoDataSet");
        // // Log.info(columnedLoDataSet);
        // Log.info("OptionsFilter :: filter :: 6");
        return columnedLoDataSet;
    }

    public advancedOrder(listOfDataSet: object[], query: any): object[] {
        let updatedListOfDataSet: object[][] = [listOfDataSet];
        let loloOrderKeys: string[] = query.OPTIONS.ORDER.keys;
        let isDirectionUP: boolean = query.OPTIONS.ORDER.dir === "UP";
        // Log.info("loloOrderKeys");
        // Log.info(loloOrderKeys);
        for (let loOrderKey of loloOrderKeys) {
            // // Log.info("loOrderKey");
            // // Log.info(loOrderKey);
            updatedListOfDataSet = this.splitByOrder(updatedListOfDataSet, loOrderKey, isDirectionUP);
        }
        let concatListOfDataSet: object[] = [];
        for (let loDataSet of updatedListOfDataSet) {
            // // Log.info("loDataSet");
            // // Log.info(loDataSet);
            concatListOfDataSet = concatListOfDataSet.concat(loDataSet);
        }
        return concatListOfDataSet;
    }

    /**
     * Iterative function that splits list of list of dataset by order
     *
     * Ex) Precondition: "courses_dept" is already sorted
     *     [
     *          [
     *              {"courses_dept": "cpsc", "courses_id": 210},
     *              {"courses_dept": "cpsc", "courses_id": 410},
     *              {"courses_dept": "cpsc", "courses_id": 310}
     *          ],
     *          [
     *              {"courses_dept": "engl", "courses_id": 110}
     *          ]
     *     ]
     *
     * => sort by courses_id smallest to largest
     *
     *     [
     *          [
     *              {"courses_dept": "cpsc", "courses_id": 210}
     *          ],
     *          [
     *              {"courses_dept": "cpsc", "courses_id": 310}
     *          ],
     *          [
     *              {"courses_dept": "cpsc", "courses_id": 410}
     *          ],
     *          [
     *              {"courses_dept": "engl", "courses_id": 110}
     *          ]
     *     ]
     */
    public splitByOrder(loloDataSet: any[][], orderKey: string, isDirectionUP: boolean): object[][] {
        // Log.info("OptionsFilter :: splitByOrder :: 1");
        let field: string;
        if (orderKey.includes("_")) {
            field = orderKey.split("_")[1];
        } else {
            field = orderKey;
        }
        // Log.info("field");
        // Log.info(field);
        // Log.info("OptionsFilter :: splitByOrder :: 2");
        let newloloDataSet: object[][] = [];
        for (let loDataSet of loloDataSet) {
            let valueMap = new Map<string | number, IDataSet[]>();
            for (let dataSet of loDataSet) {
                if (valueMap.has(dataSet[field])) {
                    let updatedloDataSet: IDataSet[] = valueMap.get(dataSet[field]);
                    updatedloDataSet.push(dataSet);
                    valueMap.set(dataSet[field], updatedloDataSet);
                } else {
                    valueMap.set(dataSet[field], [dataSet]);
                }
            }
            // covert keys of map to array
            let keysOfValueMap: Array<string | number>  = Array.from(valueMap.keys());
            // Log.info("keysOfValueMap");
            // Log.info(keysOfValueMap);
            // if keysOfValueMap contain numbers represented as strings
            // if (this.isNumber(keysOfValueMap[0])) {
            //     keysOfValueMap = [];
            //     for (let key of keysOfValueMap) {
            //         keysOfValueMap.push(Number(key));
            //     }
            // }
            let sortedKeysOfValueMap: Array<string | number> = this.sort(keysOfValueMap, isDirectionUP);
            // Log.info("sortedKeysOfValueMap");
            // Log.info(sortedKeysOfValueMap);
            for (let key of sortedKeysOfValueMap) {
                // Log.info("valueMap.get(key): ");
                // Log.info(valueMap.get(key));
                newloloDataSet.push(valueMap.get(key));
            }
        }
        // Log.info("OptionsFilter :: splitByOrder :: 3");
        // Log.info("newloloDataSet");
        // Log.info(newloloDataSet);
        return newloloDataSet;
    }

    /**
     * Sort list based on DIRECTION (UP is smallest to largest and DOWN is largest to smallest)
     *
     * Note: numbers in listOfValue were forced to be a string before this function
     */
    public sort(listOfValue: Array<string | number>, isDirectionUP: boolean): Array<string | number> {
        let len = listOfValue.length;
        for (let i = len - 1; i >= 0; i--) {
            for (let j = 1; j <= i; j++) {
                if (isDirectionUP) {
                    // smallest to largest
                    if (listOfValue[j - 1] > listOfValue[j]) {
                        let temp = listOfValue[j - 1];
                        listOfValue[j - 1] = listOfValue[j];
                        listOfValue[j] = temp;
                    }
                } else {
                    // largest to smallest
                    if (listOfValue[j - 1] < listOfValue[j]) {
                        let temp = listOfValue[j - 1];
                        listOfValue[j - 1] = listOfValue[j];
                        listOfValue[j] = temp;
                    }
                }
            }
        }
        return listOfValue;
    }

    /**
     * Create and return a dataset object that has keys of idString_field and value from dataset
     * e.g. {"courses_dept": "cpsc", "courses_avg": 75}
     */
    private createDatasetObj(dataObj: any, query: any): object {
        let columns: string[] = query.OPTIONS.COLUMNS;
        // // Log.info("columns");
        // // Log.info(columns);
        let obj: any = {};
        for (let key of columns) {
            let field: string;
            if (key.includes("_")) {
                field = key.split("_")[1];
            } else {
                field = key;
            }
            // Log.info(key);
            // const value = dataObj.get(field);
            obj[key] = dataObj[field];
            // Log.info("key value");
            // Log.info(key + " : " + value + " :: typeis " + typeof value);
            // obj[key] = value;
        }
        return obj;
    }
}
