import {Course} from "./Course";
import Log from "../Util";
import {WhereFilter} from "../Filter/WhereFilter";
import {OptionsFilter} from "../Filter/OptionsFilter";
import {TransformationsFilter} from "../Filter/TransformationsFilter";
import {IDataSet} from "./IDataSet";

export class DataFilter {
    private addedDataset: Map<string, Course[]>;
    private whereFilter: WhereFilter;
    private transformationsFilter: TransformationsFilter;
    private optionsFilter: OptionsFilter;
    public constructor(addedDataset: Map<string, Course[]>) {
        this.addedDataset = addedDataset;
        this.whereFilter = new WhereFilter();
        this.transformationsFilter = new TransformationsFilter();
        this.optionsFilter = new OptionsFilter();
    }

    /**
     * Return list of valid course object based on query
     */
    public validResult(query: any): object[] {
        const dataSetName: string = this.getDataSetName(query);
        // Log.info("detaSetName");
        // Log.info(dataSetName);
        // Log.info("DataFilter :: 1");
        // Log.info("addedDataset: ");
        // Log.info(this.addedDataset);
        // Log.info(this.addedDataset.keys());
        const listOfDataSet: IDataSet[] = this.addedDataset.get(dataSetName);
        // Log.info("DataFilter :: 2");
        // Log.info("DataFilter :: listOfDataSet");
        // Log.info(listOfDataSet);
        let whereFilteredList: object[] = this.whereFilter.filter(listOfDataSet, query);
        // Log.info("DataFilter :: 3");
        // Log.info("@@ whereFilteredList @@");
        // Log.info(whereFilteredList);
        // Log.info("DataFilter :: 4");
        if (Object.keys(query).length === 3) {
            // Log.info("DataFilter :: 4");
            // Log.info(Object.keys(query).length);
            whereFilteredList = this.transformationsFilter.filter(whereFilteredList, query);
            // Log.info("DataFilter :: 5");
            // Log.info(whereFilteredList);
        }
        let optionFilteredList: object[] = this.optionsFilter.filter(whereFilteredList, query);
        // Log.info("@@@result:@@@");
        // Log.info(optionFilteredList);
        // Log.info("DataFilter :: 6");
        // Log.info("DataFilter :: 5");
        // Log.info("end result");
        // Log.info(optionFilteredList);
        return optionFilteredList;
    }

    /**
     * Return getDataSetName of query
     *
     * Ex) Courses, Rooms, ...
     */
    private getDataSetName(query: any): string {
        // without TRANSFORMATIONS
        let result: string;
        // Log.info("result");
        if (Object.keys(query).length === 2) {
            result = query.OPTIONS.COLUMNS[0].split("_")[0];
        } else {
            result = query.TRANSFORMATIONS.GROUP[0].split("_")[0];
        }
        // Log.info(result);
        return result;
    }
}
