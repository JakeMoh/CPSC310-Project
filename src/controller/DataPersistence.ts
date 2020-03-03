import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {CourseParser} from "./CourseParser";
import {RoomParser} from "./RoomParser";

const fs = require("fs");
export class DataPersistence {
    // write courses into local data structure and on the disk. Return the string array of all added dataset
    public static writeDataset(id: string, kind: InsightDatasetKind, dataArray: any[]) {
        try {
            fs.writeFileSync("./data/" + id + "_" + kind + "_" + dataArray.length, JSON.stringify(dataArray));
        } catch (err) {
            // Log.info("file removal failed");
        }
    }

    public static readPersistedData(): any {
        let array = fs.readdirSync("./data/");

        return array;
    }

    public static readDataset(dataset: InsightDataset): any[] {
        const id = dataset.id;
        const kind = dataset.kind;
        const numRows = dataset.numRows;
        let fileData: any[] = [];
        try {
            let data = fs.readFileSync("./data/" + id + "_" + kind + "_" + numRows, "utf8");
            if (kind === InsightDatasetKind.Courses) {
                let parser = new CourseParser("");
                fileData = parser.parseCourses(data);
            } else {
                let parser = new RoomParser("");
                fileData = parser.parseRooms(data);
            }
        } catch (err) {
            //
        }

        return fileData;
    }
}
