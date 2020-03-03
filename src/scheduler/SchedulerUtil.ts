import {TimeSlot} from "./IScheduler";
import Log from "../Util";

export default class SchedulerUtil {
    public static initializeTimeSlot() {
        const t1: TimeSlot = "MWF 0800-0900";
        const t2: TimeSlot = "MWF 0900-1000";
        const t3: TimeSlot = "MWF 1000-1100";
        const t4: TimeSlot = "MWF 1100-1200";
        const t5: TimeSlot = "MWF 1200-1300";
        const t6: TimeSlot = "MWF 1300-1400";
        const t7: TimeSlot = "MWF 1400-1500";
        const t8: TimeSlot = "MWF 1500-1600";
        const t9: TimeSlot = "MWF 1600-1700";
        const t10: TimeSlot = "TR  0800-0930";
        const t11: TimeSlot = "TR  0930-1100";
        const t12: TimeSlot = "TR  1100-1230";
        const t13: TimeSlot = "TR  1230-1400";
        const t14: TimeSlot = "TR  1400-1530";
        const t15: TimeSlot = "TR  1530-1700";
        return [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15];
    }

    /*
Code modified from https://www.movable-type.co.uk/scripts/latlong.html
 */
    public static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        function toRadians(degree: number) {
            return degree * Math.PI / 180;
        }
        let r = 6371e3; // metres
        let l1 = toRadians(lat1);
        let l2 = toRadians(lat2);
        let d1 = toRadians(lat2 - lat1);
        let d2 = toRadians(lon2 - lon1);

        let a = Math.sin(d1 / 2) * Math.sin(d1 / 2) +
            Math.cos(l1) * Math.cos(l2) *
            Math.sin(d2 / 2) * Math.sin(d2 / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return r * c;
    }

    public static calculateBestSoln(soln: any[], maxE: number): any[] {
        let bestSchedule = [];
        let bestScore = Infinity;
        for (let schedule of soln) {
            // Log.info(schedule);
            let d = schedule.maxDistance / 1372;
            if (d === 0) {
                bestSchedule = schedule.tempSoln;
                break;
            }
            let e = schedule.enrollment;
            let s = (0.7 * e / maxE) + (0.3 * (1 - d));
            Log.info(s);
            if (s < bestScore && s !== 0) {
                bestScore = s;
                bestSchedule = schedule.tempSoln;
            }
            Log.info(e);
        }
        return bestSchedule;
    }

    public static keySort(key: string) {
        return function (a: any, b: any) {
            if (a[key] < b[key]) {
                return 1;
            }
            if (a[key] > b[key]) {
                return -1;
            }
            return 0;
        };
    }

    public static roomxTime(building: string, buildingObj: any): any[] {
        let rooms = buildingObj[building];
        let slottedRooms = [];
        for (let rm of rooms) {
            for (let i = 0; i < 15; i++) {
                let temp = {...rm};
                temp.time_index = i;
                slottedRooms.push(temp);
            }
        }
        return slottedRooms;
    }
}
