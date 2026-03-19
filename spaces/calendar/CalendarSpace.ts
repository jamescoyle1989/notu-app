import { Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { CalendarSpaceSetup } from "./CalendarSpaceSetup";

export class CalendarSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _event: Tag;
    get event(): Tag { return this._event; }

    private _recurringEventsProcess: Tag;
    get recurringEventsProcess(): Tag { return this._recurringEventsProcess; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(CalendarSpaceSetup.internalName);
        this._event = notu.getTagByName(CalendarSpaceSetup.event, this._space);
        this._recurringEventsProcess = notu.getTagByName(CalendarSpaceSetup.recurringEventsProcess, this._space);
    }
}