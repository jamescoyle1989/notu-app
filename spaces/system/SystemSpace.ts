import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import CreateNoteProcessNoteTagDataComponentFactory from "./CreateNoteProcessNoteTagDataComponent";
import PageNoteTagDataComponentFactory from "./PageNoteTagDataComponent";
import ProcessAvailabilityNoteTagDataComponentFactory from "./ProcessAvailabilityNoteTagDataComponent";
import ProcessNoteTagDataComponentFactory from "./ProcessNoteTagDataComponent";
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


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(SystemSpaceSetup.internalName);
        this._page = notu.getTagByName(SystemSpaceSetup.page, this._space);
        this._process = notu.getTagByName(SystemSpaceSetup.process, this._space);
        this._processAvailability = notu.getTagByName(SystemSpaceSetup.processAvailability, this._space);
        this._createNoteProcess = notu.getTagByName(SystemSpaceSetup.createNoteProcess, this._space);
        this._editNoteProcess = notu.getTagByName(SystemSpaceSetup.editNoteProcess, this._space);
        this._deleteNoteProcess = notu.getTagByName(SystemSpaceSetup.deleteNoteProcess, this._space);
    }

    
    async setup(notu: Notu): Promise<void> {
        await SystemSpaceSetup.setup(notu);
        this._load(notu);
    }


    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        if (tag.space.internalName == SystemSpaceSetup.internalName) {
            if (tag.name == SystemSpaceSetup.page)
                return new PageNoteTagDataComponentFactory();
            
            if (tag.name == SystemSpaceSetup.createNoteProcess)
                return new CreateNoteProcessNoteTagDataComponentFactory();

            if (tag.name == SystemSpaceSetup.process)
                return new ProcessNoteTagDataComponentFactory();

            if (tag.name == SystemSpaceSetup.processAvailability)
                return new ProcessAvailabilityNoteTagDataComponentFactory();
        }
        return null;
    }
}