import { Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class CommonSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _address: Tag;
    get address(): Tag { return this._address; }

    private _cancelled: Tag;
    get cancelled(): Tag { return this._cancelled; }

    private _duration: Tag;
    get duration(): Tag { return this._duration; }

    private _finished: Tag;
    get finished(): Tag { return this._finished; }

    private _generated: Tag;
    get generated(): Tag { return this._generated; }

    private _ignore: Tag;
    get ignore(): Tag { return this._ignore; }

    private _log: Tag;
    get log(): Tag { return this._log; }

    private _recurring: Tag;
    get recurring(): Tag { return this._recurring; }

    private _scheduled: Tag;
    get scheduled(): Tag { return this._scheduled; }

    private _started: Tag;
    get started(): Tag { return this._started; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(CommonSpaceSetup.internalName);
        this._address = notu.getTagByName(CommonSpaceSetup.address, this._space);
        this._cancelled = notu.getTagByName(CommonSpaceSetup.cancelled, this._space);
        this._duration = notu.getTagByName(CommonSpaceSetup.duration, this._space);
        this._finished = notu.getTagByName(CommonSpaceSetup.finished, this._space);
        this._generated = notu.getTagByName(CommonSpaceSetup.generated, this._space);
        this._ignore = notu.getTagByName(CommonSpaceSetup.ignore, this._space);
        this._log = notu.getTagByName(CommonSpaceSetup.log, this._space);
        this._recurring = notu.getTagByName(CommonSpaceSetup.recurring, this._space);
        this._scheduled = notu.getTagByName(CommonSpaceSetup.scheduled, this._space);
        this._started = notu.getTagByName(CommonSpaceSetup.started, this._space);
    }
}