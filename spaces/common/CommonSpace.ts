import { Notu, Space, Tag } from "notu";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class CommonSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _thought: Tag;
    get thought(): Tag { return this._thought; }

    private _info: Tag;
    get info(): Tag { return this._info; }


    constructor(notu: Notu) {
        this._space = notu.getSpaceByInternalName(CommonSpaceSetup.internalName);
        this._thought = notu.getTagByName(CommonSpaceSetup.thought, this._space);
        this._info = notu.getTagByName(CommonSpaceSetup.info, this._space);
    }
}