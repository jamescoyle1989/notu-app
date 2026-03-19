import { Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { RoutinesSpaceSetup } from "./RoutinesSpaceSetup";

export class RoutinesSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _routine: Tag;
    get routine(): Tag { return this._routine; }

    private _generateRoutinesProcess: Tag;
    get generateRooutinesProcess(): Tag { return this._generateRoutinesProcess; }

    private _compressRoutinesProcess: Tag;
    get compressRoutinesProcess(): Tag { return this._compressRoutinesProcess; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(RoutinesSpaceSetup.internalName);
        this._routine = notu.getTagByName(RoutinesSpaceSetup.routine, this._space);
        this._generateRoutinesProcess = notu.getTagByName(RoutinesSpaceSetup.generateRoutinesProcess, this._space);
        this._compressRoutinesProcess = notu.getTagByName(RoutinesSpaceSetup.compressRoutinesProcess, this._space);
    }
}