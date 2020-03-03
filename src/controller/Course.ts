import {error} from "util";
import {IDataSet} from "./IDataSet";

export class Course implements IDataSet {
    private dept: string;
    private instructor: string;
    private title: string;
    private uuid: string;
    private avg: number;
    private pass: number;
    private fail: number;
    private audit: number;
    private year: number;
    private id: string;

    public constructor(dept: string, id: string, avg: number, instructor: string, title: string, pass: number,
                       fail: number, audit: number, uuid: string, year: number) {
        this.dept = dept.toString();
        this.id = id.toString();
        this.avg = Number(avg);
        this.instructor = instructor.toString();
        this.title = title.toString();
        this.pass = Number(pass);
        this.fail = Number(fail);
        this.audit = Number(audit);
        this.uuid = uuid.toString();
        this.year = Number(year);
    }

    /**
     * Getter
     */
    public get(key: string): string | number {
        if (key === "dept") {
            return this.dept;
        } else if (key === "instructor") {
            return this.instructor;
        } else if (key === "title") {
            return this.title;
        } else if (key === "uuid") {
            return this.uuid;
        } else if (key === "avg") {
            return this.avg;
        } else if (key === "pass") {
            return this.pass;
        } else if (key === "fail") {
            return this.fail;
        } else if (key === "audit") {
            return this.audit;
        } else if (key === "year") {
            return this.year;
        } else if (key === "id") {
            return this.id;
        } else {
            error("Should not have reached here: received key: " + key);
            return null;
        }
    }

    /**
     * Return list of attributes
     */
    public getAttributes(): string[] {
        return ["dept", "instructor", "title", "uuid", "avg", "pass", "fail", "audit", "year", "id"];
    }
}
