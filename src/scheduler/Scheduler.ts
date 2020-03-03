import {IScheduler, SchedRoom, SchedSection, TimeSlot} from "./IScheduler";
import SchedulerUtil from "./SchedulerUtil";
import Log from "../Util";

export default class Scheduler implements IScheduler {
    private building: any;
    private buildingInfo: any;
    private buildingDist: any;
    private timeSlot: TimeSlot[];
    private maxE: number;
    private soln: any[];
    private coursePlacer: any;

    constructor() {
        this.building = {};
        this.buildingInfo = {};
        this.buildingDist = {};
        this.timeSlot = [];
        this.maxE = 0;
        this.soln = [];
        this.coursePlacer = {};
    }

    public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
        this.timeSlot = SchedulerUtil.initializeTimeSlot();
        this.initilaizeSection(sections);
        const orderKey = "courses_seats";
        let sortedCourses = sections.sort(SchedulerUtil.keySort(orderKey));
        this.initializeBuilding(rooms);
        this.generateBuildingDistance();
        let buildingArray = [];
        let counter = 0;
        let maxSeat = 0;
        for (let building of Object.keys(this.buildingInfo)) {
            if (this.buildingInfo[building].maxSeat > maxSeat) {
                maxSeat = this.buildingInfo[building].maxSeat;
            }
        }
        for (let course of sortedCourses) {
            if (course.courses_seats <= maxSeat) {
                for (let building of Object.keys(this.buildingInfo)) {
                    if (course.courses_seats <= this.buildingInfo[building].maxSeat) {
                        buildingArray.push(building);
                    }
                }
                break;
            } else {
                counter++;
            }
        }
        if (buildingArray.length !== 0) {
            for (let i = 0; i < counter; i ++) {
                sortedCourses.shift();
            }
            return this.matchCourseToRooms(sortedCourses, buildingArray);
        } else {
            return [];
        }
    }

    private initilaizeSection(sections: SchedSection[]) {
        for (let courses of sections) {
            courses.courses_seats = courses.courses_fail + courses.courses_pass + courses.courses_audit;
            this.maxE += courses.courses_seats;
            let cname = courses.courses_dept + "_" + courses.courses_id;
            if (!this.coursePlacer.hasOwnProperty(cname)) {
                this.coursePlacer[cname] = new Array(15).fill(false);
            }
        }
    }

    private initializeBuilding(rooms: SchedRoom[]) {
        for (let room of rooms) {
            room.time_index = -1;
            const objKey = room.rooms_shortname;
            if (!this.building.hasOwnProperty(objKey)) {
                this.building[objKey] = [room];
                this.buildingInfo[objKey] = {};
                this.buildingInfo[objKey].maxSeat = room.rooms_seats;
                this.buildingInfo[objKey].lon = room.rooms_lon;
                this.buildingInfo[objKey].lat = room.rooms_lat;
            } else {
                this.building[objKey].push(room);
                if (this.buildingInfo[objKey].maxSeat < room.rooms_seats) {
                    this.buildingInfo[objKey].maxSeat = room.rooms_seats;
                }
            }
        }
        const rOrderKey = "rooms_seats";
        for (let theKey of Object.keys(this.building)) {
            this.building[theKey].sort(SchedulerUtil.keySort(rOrderKey));
        }
    }

    private generateBuildingDistance() {
        for (const b1 of Object.keys(this.buildingInfo)) {
            this.buildingDist[b1] = {};
            for (const b2 of Object.keys(this.buildingInfo)) {
                if (b1 !== b2) {
                    this.buildingDist[b1][b2] = SchedulerUtil.calculateDistance(this.buildingInfo[b1].lat,
                        this.buildingInfo[b1].lon, this.buildingInfo[b2].lat, this.buildingInfo[b2].lon);
                }
            }
        }
    }

    private matchCourseToRooms(sortedCourses: SchedSection[], buildingArray: string[]): any[] {
        let soln: any[] = [];
        for (let building of buildingArray) {
            this.soln.length = 0;
            for (let keys of Object.keys(this.coursePlacer)) {
                for (let i = 0; i < 15; i++) {
                    this.coursePlacer[keys][i] = false;
                }
            }
            let courses = [...sortedCourses];
            let usedBuilding = [building];
            let maxDistance = 0;
            let enrollment = 0;
            let timexBuilding: any[][] = [SchedulerUtil.roomxTime(building, this.building)];
            while (courses.length !== 0) {
                let section = courses[0];
                let cname = section.courses_dept + "_" + section.courses_id;
                let checker = (arr: any[]) => arr.every(Boolean);
                if (checker(this.coursePlacer[cname])) {
                    courses.shift();
                    continue;
                }
                let newEnrol = this.scheduleCourse(section, timexBuilding);
                if (newEnrol !== 0) {
                    enrollment += newEnrol;
                    courses.shift();
                } else {
                    let newBldg = this.findNewBuilding(usedBuilding, maxDistance, courses[0].courses_seats);
                    if (newBldg !== null && newBldg.bestB !== null) {
                        maxDistance = newBldg.bestD;
                        usedBuilding.push(newBldg.bestB);
                        timexBuilding.push(SchedulerUtil.roomxTime(newBldg.bestB, this.building));
                    } else {
                        courses.shift();
                    }
                }
            }
            let tempSoln = [...this.soln];
            let tempSchedule = {tempSoln, maxDistance, enrollment};
            soln.push(tempSchedule);
        }
        return SchedulerUtil.calculateBestSoln(soln, this.maxE);
    }

    private findNewBuilding(usedBuilding: string[], maxDistance: number, seats: number): any {
        if (usedBuilding.length === Object.keys(this.building).length) {
            return null;
        }
        let bestD = Infinity;
        let bestB = null;
        for (let bldg of Object.keys(this.buildingInfo)) {
            if (!usedBuilding.includes(bldg) && this.buildingInfo[bldg].maxSeat >= seats) {
                let maxD = 0;
                for (let index in usedBuilding) {
                    let building = usedBuilding[index];
                    if (this.buildingDist[bldg][building] > maxD) {
                        maxD = this.buildingDist[bldg][building];
                    }
                }
                if (bestD < maxDistance) {
                    bestD = maxDistance;
                    bestB = bldg;
                    break;
                } else if (bestD > maxD) {
                    bestD = maxD;
                    bestB = bldg;
                }
            }
        }
        return {bestB, bestD};
    }

    private scheduleCourse(section: SchedSection, timexBuilding: any[][]): number {
        let cname = section.courses_dept + "_" + section.courses_id;
        for (let building of timexBuilding) {
            for (let j = 0; j < building.length; j++) {
                let room = building[j];
                if (section.courses_seats <= room.rooms_seats &&
                    !this.coursePlacer[cname][room.time_index]) {
                    this.coursePlacer[cname][room.time_index] = true;
                    this.soln.push([room, section, this.timeSlot[room.time_index]]);
                    building.splice(j, 1);
                    return section.courses_seats;
                } else if (section.courses_seats > room.rooms_seats) {
                    break;
                }
            }
        }
        return 0;
    }
}
