import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import {HttpRequestHandler} from "../HttpRequestHandler";
import {Room} from "./Room";
import Log from "../Util";
import {Course} from "./Course";
import {CourseParser} from "./CourseParser";

export class RoomParser {
    private filedata: any;
    private zipdata: any;
    constructor(zipdata: any) {
        this.zipdata = zipdata;
    }

    public readEachFile(): Promise<any[]> {
        let promises: any[] = [];
        Object.keys(this.zipdata.files).forEach((filename) => {
            if (filename.match(/^rooms\//g)) {
                promises.push(
                    this.zipdata.files[filename].async("string").then((fileData: string) => {
                        return Promise.resolve({filename: filename, fileData});
                    }).catch((error: any) => {
                        // return Promise.resolve();
                        // Log.info("error parse html files");
                    })
                );
            }
        });
        return Promise.all(promises).then((values) => {
            this.filedata = [].concat.apply([], values);
            return this.parse();
                // return DataReadAndWrite.parseRoomHtml([].concat.apply([], values));
        });
    }

    public parse(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            resolve(this.parseRoomHtml());
        }).then((index) => {
            const parse5 = require("parse5");
            const document = parse5.parse(index);
            return this.getTableFromHtml(document);
        }).then((roomTables) => {
            if (roomTables === null) {
                return Promise.reject(new InsightError("no valid building file"));
            }
            return Promise.resolve(this.parseTableToRows(roomTables));
        }).then((listRows) => {
            return Promise.resolve(this.parseRowInfo(listRows, null));
        }).then((listBuildings) => {
            return HttpRequestHandler.getGeoLocation(listBuildings);
        }).then((res) => {
            let result = this.parseBuildingToRoom(res);
            Log.info(result.length);
            return Promise.resolve(result);
        });
    }

    private parseRoomHtml(): Promise<string> {
        let indexFile: any;
        let numIndex = 0;
        for (let files of this.filedata) {
            files.filename = files.filename.replace(/^rooms/g, ".");
            if (files.filename === "./index.htm") {
                Log.info("found index file");
                numIndex++;
                indexFile = files;
            }
        }
        if (numIndex === 1) {
            return Promise.resolve(indexFile.fileData);
        } else {
            return Promise.reject(new InsightError("does not contain index.htm"));
        }
    }

    private getTableFromHtml(node: any): any {
        let table = null;
        if (node.childNodes != null) {
            for (let val of node.childNodes) {
                if (val.nodeName === "table" && this.isValidTable(val)) {
                    table = this.getTableBody(val);
                    break;
                } else {
                    table = this.getTableFromHtml(val);
                    if (table !== null) {
                        break;
                    }
                }
            }
        }
        return table;
    }

    private getTableBody(val: any) {
        for (let node of val.childNodes) {
            if (node.nodeName === "tbody") {
                return node;
            }
        }
    }

    private isValidTable(val: any): boolean {
        for (let attr of val.attrs) {
            if (attr.value === "views-table cols-5 table") {
                return true;
            }
        }
        return false;
    }

    private parseTableToRows(roomTables: any): Array<{}> {
        let rows = [];
        for (let tableRows of roomTables.childNodes) {
            if (tableRows.nodeName === "tr") {
                rows.push(tableRows);
            }
        }
        return rows;
    }

    private parseRowInfo(listRows: any[], building: any): any[] {
        let rooms = [];
        for (let rows of listRows) {
            let listCells = this.parseRowsToCells(rows);
            // Log.info(listCells);
            if (building === null) {
                if (this.parseBuildingCellInfo(listCells) !== undefined) {
                    rooms.push(this.parseBuildingCellInfo(listCells));
                }
            } else {
                let room = this.parseRoomCellInfo(listCells, building);
                if (room !== undefined) {
                    rooms.push(room);
                }
            }
        }
        return rooms;
    }

    private parseRowsToCells(rows: any) {
        let listCells = [];
        for (let cells of rows.childNodes) {
            if (cells.nodeName === "td") {
                listCells.push(cells);
            }
        }
        return listCells;
    }

    private parseBuildingCellInfo(listCell: any) {
        let hyperlink: string;
        let address: string;
        let code: string;
        let name: string;
        for (let cell of listCell) {
            let attrValue = cell.attrs[0].value;
            if (attrValue.includes("title")) {
                hyperlink = this.getHrefInfo(cell.childNodes);
                name = this.getHyperlinkText(cell.childNodes);
            } else if (attrValue.includes("building-address")) {
                address = this.getCellTextInfo(cell.childNodes);
            } else if (attrValue.includes("building-code")) {
                code = this.getCellTextInfo(cell.childNodes);
            }
        }
        if (address !== undefined && code !== undefined && name !== undefined && hyperlink !== undefined) {
            let building = new Room(code, name, address);
            building.setFileLink(hyperlink);
            return building;
        } else {
            return;
        }
    }

    private parseRoomCellInfo(listCells: any, building: Room): Room {
        let room = new Room(building.getShortname(), building.getFullname(), building.getAddress());
        room.setLat(building.getLat());
        room.setLon(building.getLon());
        for (let cell of listCells) {
            let attrValue = cell.attrs[0].value;
            if (attrValue.includes("room-number")) {
                room.setNumber(this.getHyperlinkText(cell.childNodes));
            } else if (attrValue.includes("room-capacity")) {
                room.setSeats(this.getCellTextInfo(cell.childNodes));
            } else if (attrValue.includes("room-furniture")) {
                room.setFurniture(this.getCellTextInfo(cell.childNodes));
            } else if (attrValue.includes("room-type")) {
                room.setType(this.getCellTextInfo(cell.childNodes));
            } else if (attrValue.includes("nothing")) {
                room.setHref(this.getHrefInfo(cell.childNodes));
            }
        }
        room.setName();
        if (room.isUndefined()) {
            return;
        }
        return room;
    }

    private getHyperlinkText(nameChildNode: any): any {
        for (let node of nameChildNode) {
            if (node.nodeName === "a") {
                for (let child of node.childNodes) {
                    if (child.nodeName === "#text") {
                        return child.value;
                    }
                }
            }
        }
    }

    private getHrefInfo(linkChildNode: any): any {
        for (let node of linkChildNode) {
            if (node.nodeName === "a") {
                for (let attributes of node.attrs) {
                    if (attributes.name === "href") {
                        return attributes.value;
                    }
                }
            }
        }
    }

    private getCellTextInfo(childNode: any): any {
        for (let node of childNode) {
            if (node.nodeName === "#text") {
                return node.value.replace("\n", "").trim();
            }
        }
    }

    private parseBuildingToRoom(listBuildings: any): Room[] {
        let rooms: any[] = [];
        for (let building of listBuildings) {
            let href = building.getFileLink();
            for (let files of this.filedata) {
                if (href === files.filename) {
                    if (this.getTablesInRoom(files.fileData, building) !== undefined) {
                        rooms = rooms.concat(this.getTablesInRoom(files.fileData, building));
                    }
                }
            }
        }
        return rooms;
    }

    private getTablesInRoom(fileData: string, building: Room): any[] {
        // if (fileData.trim().match(/^<!DOCTYPE\shtml/i)) {
        const parse5 = require("parse5");
        const document = parse5.parse(fileData);
        let table = this.getTableFromHtml(document);
        if (table === null || fileData.match(/^abc/)) {
            return [];
        }
        let rows = this.parseTableToRows(table);
        return this.parseRowInfo(rows, building);
        // } else {
        //     return;
        // }
    }

    public parseRooms(data: string): any[] {
        let result: any;
        try {
            result = JSON.parse(data);
        } catch (err) {
            // Log.info("invalid json object");
            return [];
        }
        let rooms: Room[] = [];
        for (const room in result) {
            let myRoom = result[room];
            let roomInfo = new Room(myRoom.shortname, myRoom.fullname, myRoom.address);
            roomInfo.setFurniture(myRoom.furniture);
            roomInfo.setNumber(myRoom.number);
            roomInfo.setHref(myRoom.href);
            roomInfo.setLat(myRoom.lat);
            roomInfo.setLon(myRoom.lon);
            roomInfo.setSeats(myRoom.seats);
            roomInfo.setType(myRoom.type);
            roomInfo.setName();
            rooms.push(roomInfo);
        }
        return rooms;
    }
}
