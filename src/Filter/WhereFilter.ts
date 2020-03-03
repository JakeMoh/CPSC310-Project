import { IDataSet } from "../controller/IDataSet";
import Log from "../Util";
import {error} from "util";

export class WhereFilter {
    /**
     * Filter list of dataset based on FILTER of WHERE
     *
     * NOTE: Function is same as D1
     */
    public filter(listOfDataSet: IDataSet[], query: any): object[] {
        // list of valid courses (empty)
        // Log.info("WhereFilter :: 1");
        let listOfValidDataObj: object[] = [];
        // Log.info("WhereFilter :: 2");
        // list of fields of "COLUMNS" in query (e.g. dept, id, avg, ...)
        const filter: object = query.WHERE;
        // Log.info("WhereFilter :: 3");
        // // Log.info("listOfDataSet:");
        // // Log.info(listOfDataSet);
        for (const dataset of listOfDataSet) {
            // // Log.info("WhereFilter :: 4");
            // check if course is valid based on filter
            // // // Log.info("0");
            if (this.isCourseValid(dataset, filter)) {
                // // Log.info("WhereFilter :: 5");
                // create an course object and add it to list of valid courses
                let dataObj: any = {};
                for (let attr of dataset.getAttributes()) {
                    dataObj[attr] = dataset.get(attr);
                }
                listOfValidDataObj.push(dataObj);
            }
        }
        // Log.info("WhereFilter :: 6");
        // // // Log.info("listOfValidDataSet: " + listOfValidDataSet);
        return listOfValidDataObj;
    }

    /**
     * Return true if course is valid based on filter, otherwise return false
     */
    private isCourseValid(dataset: any, filter: any): boolean {
        // empty filter is valid
        // // // Log.info("1");
        if (Object.keys(filter).length === 0) {
            return true;
        }
        // // // Log.info("2");
        let filterKey = Object.keys(filter)[0]; // (e.g "GT")
        let key = Object.keys(filter[filterKey])[0]; // (e.g course_avg)
        let field = key.split("_")[1]; // (e.g avg)
        if (Object.keys(filter)[0] === "GT") {
            // // // Log.info("3");
            let courseValue = dataset.get(field); // (e.g 88.65)
            let filterObj = filter[filterKey]; // { courses_avg: 97 }
            let queryValue = filterObj[Object.keys(filterObj)[0]];
            return courseValue > queryValue;
        } else if (Object.keys(filter)[0] === "EQ") {
            // // // Log.info("4");
            let courseValue = dataset.get(field);
            let filterObj = filter[filterKey];
            let queryValue = filterObj[Object.keys(filterObj)[0]];
            return courseValue === queryValue;
        } else if (Object.keys(filter)[0] === "LT") {
            // // // Log.info("5");
            let courseValue = dataset.get(field);
            let filterObj = filter[filterKey];
            let queryValue = filterObj[Object.keys(filterObj)[0]];
            return courseValue < queryValue;
        } else if (Object.keys(filter)[0] === "IS") {
            // // // Log.info("6");
            let courseValue = dataset.get(field);
            let filterObj = filter[filterKey];
            let isValueValue = filterObj[Object.keys(filterObj)[0]]; // (e.g. "*cpsc*")
            if (isValueValue === "") {
                return courseValue === "";
            }
            // return true if courseValue has correct regular expression of isValueValue
            return this.checkRegex(isValueValue, courseValue);
        } else if (Object.keys(filter)[0] === "AND") {
            // // // Log.info("7");
            let b = true;
            filterKey = Object.keys(filter)[0];
            let filters = filter[filterKey];
            // if there is at least one invalid course, then return false
            for (let objFilter of filters) {
                b = b && this.isCourseValid(dataset, objFilter);
            }
            return b;
        } else if (Object.keys(filter)[0] === "OR") {
            // // // Log.info("8");
            let b = false;
            filterKey = Object.keys(filter)[0];
            let filters = filter[filterKey];
            // if there is at least one valid course, then return true
            for (let objFilter of filters) {
                b = b || this.isCourseValid(dataset, objFilter);
            }
            return b;
        } else if (Object.keys(filter)[0] === "NOT") {
            // // // Log.info("9");
            filterKey = Object.keys(filter)[0];
            let filterObj = filter[filterKey];
            // negation recursion
            return !this.isCourseValid(dataset, filterObj);
        }
        error("Should not have reached here!");
        return false;
    }

    /**
     * Check if the course string matches the query string with RegEx. Returns true if string matches, false otherwise
     */
    private checkRegex(queryValue: string, courseValue: string): boolean {
        if (
            queryValue[0] === "*" &&
            queryValue[queryValue.length - 1] === "*"
        ) {
            queryValue = queryValue.replace(/\*/g, ".*");
        } else if (queryValue[0] === "*") {
            queryValue = queryValue.replace(/\*/g, ".*") + "$";
        } else if (queryValue[queryValue.length - 1] === "*") {
            queryValue = ("^" + queryValue).replace(/\*/g, ".*");
        }
        let regex = new RegExp(queryValue, "g");
        return regex.test(courseValue);
    }
}
