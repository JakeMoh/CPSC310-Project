import {error} from "util";
import {IDataSet} from "./IDataSet";

export class Room implements IDataSet {
    private fullname: string;
    private shortname: string;
    private number: string;
    private name: string;
    private address: string;
    private lat: number;
    private lon: number;
    private seats: number;
    private type: string;
    private furniture: string;
    private href: string;
    private fileLink: string;

    public constructor(shortname: string, fullname: string, address: string) {
        this.shortname = shortname;
        this.address = address;
        this.fullname = fullname;
    }

    /**
     * Getter
     */
    public get(key: string): string | number {
        if (key === "fullname") {
            return String(this.fullname);
        } else if (key === "shortname") {
            return String(this.shortname);
        } else if (key === "number") {
            return String(this.number);
        } else if (key === "name") {
            return String(this.name);
        } else if (key === "address") {
            return String(this.address);
        } else if (key === "lat") {
            return Number(this.lat);
        } else if (key === "lon") {
            return Number(this.lon);
        } else if (key === "seats") {
            return Number(this.seats);
        } else if (key === "type") {
            return String(this.type);
        } else if (key === "furniture") {
            return String(this.furniture);
        } else if (key === "href") {
            return String(this.href);
        } else if (key === "fileLink") {
            return String(this.fileLink);
        } else {
            error("Should not have reached here: received key: " + key);
            return null;
        }
    }

    /**
     * Return list of attributes
     */
    public getAttributes(): string[] {
        return ["fullname", "shortname", "number", "name", "address", "lat",
            "lon", "seats", "type", "furniture", "href", "fileLink"];
    }

    public isUndefined() {
        return (this.fullname === undefined || this.shortname === undefined || this.number === undefined ||
            this.name === undefined || this.address === undefined || this.lat === undefined || this.lon === undefined ||
            this.seats === undefined || this.type === undefined || this.furniture === undefined ||
            this.href === undefined);
    }

    public getShortname() {
        return this.shortname;
    }

    public getFullname() {
        return this.fullname;
    }

    public getAddress() {
        return this.address;
    }

    public setFileLink(link: string) {
        this.fileLink = link;
    }

    public getFileLink() {
        return this.fileLink;
    }

    public setHref(href: string) {
        this.href = href;
    }

    public setNumber(num: string) {
        this.number = num;
    }

    public setSeats(seats: any) {
        this.seats = seats;
    }

    public setType(type: string) {
        this.type = type;
    }

    public setFurniture(furniture: string) {
        this.furniture = furniture;
    }

    public setName() {
        if (this.shortname === undefined || this.number === undefined) {
            this.name = undefined;
        } else {
            this.name = this.shortname + "_" + this.number;
        }
    }

    public setLat(lat: any) {
        this.lat = Number(lat);
    }

    public setLon(lon: any) {
        this.lon = Number(lon);
    }

    public getLat() {
        return this.lat;
    }

    public getLon() {
        return this.lon;
    }
}
