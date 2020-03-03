import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import * as JSZip from "jszip";
import {QueryValidator} from "./QueryValidator";
import {DataFilter} from "./DataFilter";
import {DataPersistence} from "./DataPersistence";
import {CourseParser} from "./CourseParser";
import {RoomParser} from "./RoomParser";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
const fs = require("fs");
export default class InsightFacade implements IInsightFacade {
    private addedDataset: Map<string, Course[]>;
    // private listDataset: InsightDataset[];
    private listDataId: string[];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
        this.addedDataset = new Map<string, Course[]>();
        this.listDataId = [];
        // this.listDataset = [];
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        return new Promise((resolve, reject) => {
            // if id has illegal characters, reject promise
            if (!(/^[^_]+$/.test(id) && /^[^\s]+$/.test(id) && id !== null && id !== undefined)) {
                return reject(new InsightError("invalid id"));
            }
            return resolve(this.listDatasets());
        }).then(() => {
            if (this.listDataId.includes(id)) {
                return Promise.reject(new InsightError("dataset already exists"));
            }
            let zip = new JSZip();
            return zip.loadAsync(content, {base64: true}).then((zipfile: any) => {
                return Promise.resolve(zipfile);
            }).catch((error) => {
                return Promise.reject(new InsightError("file not in zip format"));
            });
        }).then((zip: any) => {
            Log.info("file unzip successful");
            if (kind === InsightDatasetKind.Courses) {
                return new CourseParser(zip).readEachFile();
            } else {
                return new RoomParser(zip).readEachFile();
            }
        }).then((resultList: any[]) => {
            if (resultList.length !== 0) {
                // Log.info("InsightFacade :: addDataSet :: resultList");
                // Log.info(resultList);
                // Log.info(resultList.length);
                this.addedDataset.set(id, resultList);
                this.listDataId.push(id);
                DataPersistence.writeDataset(id, kind, resultList);
                return Promise.resolve(this.listDataId);
            } else {
                return Promise.reject(new InsightError("no valid section/room"));
            }
        });
    }

    public removeDataset(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!(/^[^_]+$/.test(id) && /^[^\s]+$/.test(id) && id !== null && id !== undefined)) {
                return reject(new InsightError("invalid id"));
            }
            return resolve(this.listDatasets());
        }).then ((res: any) => {
            if (!this.listDataId.includes(id)) {
                return Promise.reject(new NotFoundError("dataset doesn't exist"));
            }
            if (this.addedDataset.has(id)) {
                this.addedDataset.delete(id);
            }
            let curr: InsightDataset;
            for (let dataset of res) {
                if (dataset.id === id) {
                    curr = dataset;
                }
            }
            try {
                fs.unlinkSync("./data/" + id + "_" + curr.kind + "_" + curr.numRows);
            } catch (err) {
                // Log.info("file removal failed");
            }
            return Promise.resolve(id);
        });
    }

    public performQuery(query: any): Promise<any[]> {
        return this.listDatasets().then((result: any) => {
            const courseValidator = new QueryValidator(result);
            // Log.info("this.addedDataset");
            // Log.info(this.addedDataset);
            // Log.info(this.listDataset);
            return Promise.resolve(courseValidator.validateQuery(query));
        }).then((res: any) => {
            if (!this.addedDataset.has(res.id)) {
                this.addedDataset.set(res.id, DataPersistence.readDataset(res));
            }
            const dataFilter = new DataFilter(this.addedDataset);
            return Promise.resolve(dataFilter.validResult(query));
        }).then((result) => {
            if (result.length  > 5000) {
                return Promise.reject(new ResultTooLargeError());
            } else {
                return Promise.resolve(result);
            }
            // }).catch(function (err) {
            //     return err;
        });
    }

    public listDatasets(): Promise<InsightDataset[]> {
        this.listDataId = [];
        let listDataset: InsightDataset[] = [];
        let dataset = DataPersistence.readPersistedData();
        for (let data of dataset) {
            let fileData = data.split("_");
            this.listDataId.push(fileData[0]);
            if (fileData[1] === "courses") {
                listDataset.push({id: fileData[0], kind: InsightDatasetKind.Courses, numRows: Number(fileData[2])});
            } else {
                listDataset.push({id: fileData[0], kind: InsightDatasetKind.Rooms, numRows: Number(fileData[2])});
            }
        }
        return Promise.resolve(listDataset);
    }
}
