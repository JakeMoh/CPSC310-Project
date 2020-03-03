import {Room} from "./controller/Room";
import Log from "./Util";

export const http = require("http");

export class HttpRequestHandler {
    public static getGeoLocation(tempRoom: Room[]): Promise<any[]> {
        let promises: any[] = [];
        tempRoom.forEach((room) => {
            let address = room.getAddress().replace(/\s/g, "%20");
            let url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team211/" + address;
            promises.push(
                this.getHttpResponse(url).then((data: any) => {
                    if (data.hasOwnProperty("error")) {
                        return Promise.resolve(null);
                    } else {
                        room.setLat(data.lat);
                        room.setLon(data.lon);
                        return Promise.resolve(room);
                    }
                })
            );
        });
        return Promise.all(promises).then((values) => {
            return values.filter(function (elem) {
                return elem != null;
            });
        });
    }

    private static getHttpResponse(addressUrl: string) {
        return new Promise((resolve, reject) => {
            let req = http.get(addressUrl, (res: any) => {
                // if (res.statusCode < 200 || res.statusCode >= 300) {
                //     return reject(new Error("statusCode=" + res.statusCode));
                // }
                let data = "";
                res.on("data", (chunk: any) => {
                    data += chunk;
                });
                res.on("end", () => {
                    try {
                        const parsedData = JSON.parse(data);
                        resolve(parsedData);
                    } catch (e) {
                        reject(e.message);
                    }
                });
            });
            req.on("error", (e: any) => {
                resolve(e);
            });
            req.end();
        });
    }
}
