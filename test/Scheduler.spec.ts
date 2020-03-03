import {expect} from "chai";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import Scheduler from "../src/scheduler/Scheduler";
import * as fs from "fs-extra";
import {SchedRoom, SchedSection} from "../src/scheduler/IScheduler";

describe("scheduler test", function () {

    let course1: SchedSection = {
        courses_dept: "cpsc",
        courses_id: "310",
        courses_uuid: "???",
        courses_pass: 100,
        courses_fail: 0,
        courses_audit: 0
    };

    let course2: SchedSection = {
        courses_dept: "math",
        courses_id: "310",
        courses_uuid: "???",
        courses_pass: 300,
        courses_fail: 0,
        courses_audit: 0
    };

    let course3: SchedSection = {
        courses_dept: "cpsc",
        courses_id: "310",
        courses_uuid: "???",
        courses_pass: 400,
        courses_fail: 0,
        courses_audit: 0
    };

    let course4: SchedSection = {
        courses_dept: "cpsc",
        courses_id: "210",
        courses_uuid: "???",
        courses_pass: 300,
        courses_fail: 0,
        courses_audit: 0
    };

    let course5: SchedSection = {
        courses_dept: "psyc",
        courses_id: "110",
        courses_uuid: "???",
        courses_pass: 300,
        courses_fail: 0,
        courses_audit: 0
    };

    let course6: SchedSection = {
        courses_dept: "comm",
        courses_id: "110",
        courses_uuid: "???",
        courses_pass: 300,
        courses_fail: 0,
        courses_audit: 0
    };

    let room1: SchedRoom = {
        rooms_shortname: "math",
        rooms_number: "100",
        rooms_seats: 5,
        rooms_lat: 123,
        rooms_lon: 123
    };

    let room2: SchedRoom = {
        rooms_shortname: "math",
        rooms_number: "200",
        rooms_seats: 300,
        rooms_lat: 123,
        rooms_lon: 123
    };

    let room3: SchedRoom = {
        rooms_shortname: "geo",
        rooms_number: "100",
        rooms_seats: 300,
        rooms_lat: 124,
        rooms_lon: 123
    };

    let room4: SchedRoom = {
        rooms_shortname: "wood",
        rooms_number: "100",
        rooms_seats: 300,
        rooms_lat: 123.5,
        rooms_lon: 123
    };

    let room5: SchedRoom = {
        rooms_shortname: "dmp",
        rooms_number: "100",
        rooms_seats: 200,
        rooms_lat: 123.5,
        rooms_lon: 123
    };

    let room6: SchedRoom = {
        rooms_shortname: "dmp",
        rooms_number: "200",
        rooms_seats: 300,
        rooms_lat: 123.5,
        rooms_lon: 123
    };

    let scheduler = new Scheduler();

    before(function () {
        Log.test(`Before all`);
    });

    beforeEach( function () {
        scheduler = new Scheduler();
    });

    it("test1", function () {
        let courses = [course1, course2, course3];
        let rooms = [room2];
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test2", function () {
        let courses = new Array(15).fill(course2);
        courses.push(course1);
        let rooms = [room2];
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test3", function () {
        let courses = new Array(15).fill(course2);
        courses.push(course1);
        let rooms = [room2, room1];
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test4", function () {
        let courses = new Array(15).fill(course2);
        courses.push(course1);
        let rooms = [room2, room1, room3, room4];
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("should have 16 courses", function () {
        let courses = new Array(14).fill(course2);
        courses.push(course1);
        courses.push(course2);
        let rooms = [room2, room1, room3, room4];
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test5", function () {
        let courses = new Array(15).fill(course2);
        courses.push(course1);
        let rooms = [room1];
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test6", function () {
        let courses = new Array(14).fill(course2);
        courses.push(course4);
        let courses2 = new Array(15).fill(course4);
        courses2[0] = course2;
        courses = courses.concat(courses2);
        let rooms = [room2, room3];
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test7", function () {
        let courses = new Array(14).fill(course2);
        courses.push(course4);
        courses.push(course2);
        let rooms = [room2, room3];
        Log.info(scheduler.schedule(courses, rooms));
    });

    it("test8", function () {
        let courses = new Array(18).fill(course2);
        let rooms = [room2, room3];
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test9", function () {
        let courses = new Array(15).fill(course2);
        let rooms = [room1, room2, room3, room4, room5];
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test horizontal swap", function () {
        let courses = new Array(15).fill(course2);
        courses[0] = course4;
        courses.push(course4);
        courses.push(course4);
        courses.push(course2);
        courses.push(course4);
        let rooms = [room2, room3];
        Log.info(scheduler.schedule(courses, rooms));
    });

    it("test11", function () {
        let courses = [course1, course2];
        let rooms = [room2, room5];
        Log.info(scheduler.schedule(courses, rooms));
    });

    it("test vertical swap success case", function () {
        let courses = new Array(14).fill(course2);
        courses = [course5].concat(courses);
        let courses2 = new Array(14).fill(course4);
        courses2 = [course6].concat(courses2);
        courses = courses.concat(courses2);
        courses.push(course2);
        courses.push(course4);
        let rooms = [room2, room3, room4];
        // let ctest = [...[course5], ...courses, ...courses2]
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test swap fail case look for new course", function () {
        let courses = new Array(16).fill(course2);
        let courses2 = new Array(14).fill(course4);
        courses = courses.concat(courses2);
        courses.push(course1);
        let rooms = [room2, room3, room4];
        // let ctest = [...[course5], ...courses, ...courses2]
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test swap fail case no new courses", function () {
        let courses = new Array(15).fill(course2);
        let courses2 = new Array(15).fill(course4);
        let courses3 = new Array(14).fill(course5);
        courses = courses.concat(courses2).concat([course2]).concat(courses3);
        courses.push(course4);
        courses.push(course4);
        let rooms = [room2, room3, room4, room6];
        Log.info(scheduler.schedule(courses, rooms).length);
    });

    it("test swap success new courses existed", function () {
        let courses = new Array(15).fill(course2);
        let courses2 = new Array(14).fill(course4);
        courses = courses.concat([course5]).concat(courses2).concat(courses);
        courses.push(course5);
        let rooms = [room2, room3, room4, room6];
        // let ctest = [...[course5], ...courses, ...courses2]
        Log.info(scheduler.schedule(courses, rooms).length);
    });


});
