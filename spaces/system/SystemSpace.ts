import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Notu, ParsedQuery, Space, Tag } from "notu";
import { ReactNode } from "react";
import { LogicalSpace } from "../LogicalSpace";
import defs from "./SystemSpaceDefs";

export class SystemSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _page: Tag;
    get page(): Tag { return this._page; }

    private _process: Tag;
    get process(): Tag { return this._process; }

    private _processAvailability: Tag;
    get processAvailability(): Tag { return this._processAvailability; }

    private _filter: Tag;
    get filter(): Tag { return this._filter; }

    private _createNoteProcess: Tag;
    get createNoteProcess(): Tag { return this._createNoteProcess; }

    private _editNoteProcess: Tag;
    get editNoteProcess(): Tag { return this._editNoteProcess; }

    private _deleteNoteProcess: Tag;
    get deleteNoteProcess(): Tag { return this._deleteNoteProcess; }

    private _cloneNoteProcess: Tag;
    get cloneNoteProcess(): Tag { return this._cloneNoteProcess; }

    private _showRelatedNotesProcess: Tag;
    get showRelatedNotesProcess(): Tag { return this._showRelatedNotesProcess; }

    private _deleteDisplayedNotesProcess: Tag;
    get deleteDisplayedNotesProcess(): Tag { return this._deleteDisplayedNotesProcess; }

    private _passwordProtection: Tag;
    get passwordProtection(): Tag { return this._passwordProtection; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(defs.internalName);
        this._page = notu.getTagByName(defs.page, this._space);
        this._process = notu.getTagByName(defs.process, this._space);
        this._processAvailability = notu.getTagByName(defs.processAvailability, this._space);
        this._filter = notu.getTagByName(defs.filter, this._space);
        this._createNoteProcess = notu.getTagByName(defs.createNoteProcess, this._space);
        this._editNoteProcess = notu.getTagByName(defs.editNoteProcess, this._space);
        this._deleteNoteProcess = notu.getTagByName(defs.deleteNoteProcess, this._space);
        this._cloneNoteProcess = notu.getTagByName(defs.cloneNoteProcess, this._space);
        this._showRelatedNotesProcess = notu.getTagByName(defs.showRelatedNotesProcess, this._space);
        this._deleteDisplayedNotesProcess = notu.getTagByName(defs.deleteDisplayedNotesProcess, this._space);
        this._passwordProtection = notu.getTagByName(defs.passwordProtection, this._space);
    }
}


export interface FilterComponentFactory extends NoteTagDataComponentFactory {

    getFilterComponent(query: ParsedQuery, onChange: (query: ParsedQuery) => void, notu: Notu): ReactNode;
}


export interface FilterComponentProps {
    query: ParsedQuery,
    onChange: (query: ParsedQuery) => void,
    notu: Notu
}