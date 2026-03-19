import { Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { PeopleSpaceSetup } from "./PeopleSpaceSetup";

export class PeopleSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _person: Tag;
    get person(): Tag { return this._person; }

    private _circle: Tag;
    get circle(): Tag { return this._circle; }

    private _celebration: Tag;
    get celebration(): Tag { return this._celebration; }

    private _celebrationEventsProcess: Tag;
    get celebrationEventsProcess(): Tag { return this._celebrationEventsProcess; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(PeopleSpaceSetup.internalName);
        this._person = notu.getTagByName(PeopleSpaceSetup.person, this._space);
        this._circle = notu.getTagByName(PeopleSpaceSetup.circle, this._space);
        this._celebration = notu.getTagByName(PeopleSpaceSetup.celebration, this._space);
        this._celebrationEventsProcess = notu.getTagByName(PeopleSpaceSetup.celebrationEventsProcess, this._space);
    }
}