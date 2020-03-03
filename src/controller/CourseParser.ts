import {Course} from "./Course";
import Log from "../Util";

export class CourseParser {
    /**
     * Parses the course file into Course object
     * @param fileData: input JSON object containing all course information
     *
     * @return An array of courses
     *
     * Parses the JSON Object. Checks each JSON object for the presence of all keys necessary for creating the course
     * object. If all needed keys are present, create the course object. Otherwise do nothing.
     */
    private zipdata: any;
    constructor(fileData: any) {
        this.zipdata = fileData;
    }

    public readEachFile(): Promise<Course[]> {
        let promises: any[] = [];
        Object.keys(this.zipdata.files).forEach((filename) => {
            if (filename.match(/^courses\//g)) {
                promises.push(
                    this.zipdata.files[filename].async("string").then((fileData: string) => {
                        return Promise.resolve(this.parse(fileData));
                    }).catch((error: any) => {
                        // return Promise.resolve();
                        // Log.info("error from reading zip");
                    })
                );
            }
        });
        return Promise.all(promises).then((values) => {
            return [].concat.apply([], values);
        });
    }

    public parse(filedata: string): Course[] {
        let result: any;
        try {
            result = JSON.parse(filedata);
        } catch (err) {
            Log.info("invalid json object");
            return [];
        }
        let validCourses: Course[] = [];
        // let result = JSON.parse(filedata);
        let courses = result.result;
        // Log.info("CourseParser :: parse :: courses")
        for (const sect in courses) {
            let mySect = courses[sect];
            // Log.info("mySect");
            // Log.info(mySect);
            const neededKeys = ["Subject", "Course", "Avg", "Professor", "Title", "Pass", "Fail",
                "Audit", "id", "Year"];
            let containAll = neededKeys.every((key) => {
                return Object.keys(courses[sect]).includes(key);
            });
            if (containAll) {
                let courseInfo: Course;
                if (Object.keys(courses[sect]).includes("Section") && courses[sect].Section === "overall") {
                    courseInfo = new Course(mySect.Subject, mySect.Course, mySect.Avg,
                        mySect.Professor, mySect.Title, mySect.Pass, mySect.Fail,
                        mySect.Audit, mySect.id, 1900);
                } else {
                    courseInfo = new Course(mySect.Subject, mySect.Course, mySect.Avg,
                        mySect.Professor, mySect.Title, mySect.Pass, mySect.Fail,
                        mySect.Audit, mySect.id, mySect.Year);
                }
                validCourses.push(courseInfo);
            }
        }
        return validCourses;
    }

    public parseCourses(filedata: string): Course[] {
        let result: any;
        try {
            result = JSON.parse(filedata);
        } catch (err) {
            Log.info("invalid json object");
            return [];
        }
        let validCourses: Course[] = [];
        // let result = JSON.parse(filedata);
        // Log.info("CourseParser :: parse :: courses")
        for (const mySect of result) {
            // let mySect = result[sect];
            let courseInfo = new Course(mySect.dept, mySect.id, mySect.avg,
                        mySect.instructor, mySect.title, mySect.pass, mySect.fail,
                        mySect.audit, mySect.uuid, mySect.year);
            validCourses.push(courseInfo);
        }
        return validCourses;
    }
}
