import { Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import defs from "./SystemSpaceDefs";
import { SystemSpaceSetup } from "./SystemSpaceSetup";

export class SystemSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _page: Tag;
    get page(): Tag { return this._page; }

    private _process: Tag;
    get process(): Tag { return this._process; }

    private _processAvailability: Tag;
    get processAvailability(): Tag { return this._processAvailability; }

    private _createNoteProcess: Tag;
    get createNoteProcess(): Tag { return this._createNoteProcess; }

    private _editNoteProcess: Tag;
    get editNoteProcess(): Tag { return this._editNoteProcess; }

    private _deleteNoteProcess: Tag;
    get deleteNoteProcess(): Tag { return this._deleteNoteProcess; }

    private _cloneNoteProcess: Tag;
    get cloneNoteProcess(): Tag { return this._cloneNoteProcess; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(defs.internalName);
        this._page = notu.getTagByName(defs.page, this._space);
        this._process = notu.getTagByName(defs.process, this._space);
        this._processAvailability = notu.getTagByName(defs.processAvailability, this._space);
        this._createNoteProcess = notu.getTagByName(defs.createNoteProcess, this._space);
        this._editNoteProcess = notu.getTagByName(defs.editNoteProcess, this._space);
        this._deleteNoteProcess = notu.getTagByName(defs.deleteNoteProcess, this._space);
        this._cloneNoteProcess = notu.getTagByName(defs.cloneNoteProcess, this._space);
    }

    
    async setup(notu: Notu): Promise<void> {
        await SystemSpaceSetup.setup(notu);
        this._load(notu);
    }
}