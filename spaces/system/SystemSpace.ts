import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import CloneNoteProcessNoteTagDataComponentFactory from "./CloneNoteProcessNoteTagDataComponent";
import CreateNoteProcessNoteTagDataComponentFactory from "./CreateNoteProcessNoteTagDataComponent";
import CustomProcessNoteTagDataComponentFactory from "./CustomProcessNoteTagDataComponent";
import EditNoteProcessNoteTagDataComponentFactory from "./EditNoteProcessNoteTagDataComponent";
import PageNoteTagDataComponentFactory from "./PageNoteTagDataComponent";
import ProcessAvailabilityNoteTagDataComponentFactory from "./ProcessAvailabilityNoteTagDataComponent";
import ProcessNoteTagDataComponentFactory from "./ProcessNoteTagDataComponent";
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


    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        if (tag.space.internalName == defs.internalName) {
            if (tag.name == defs.page)
                return new PageNoteTagDataComponentFactory();
            
            if (tag.name == defs.createNoteProcess)
                return new CreateNoteProcessNoteTagDataComponentFactory();

            if (tag.name == defs.editNoteProcess)
                return new EditNoteProcessNoteTagDataComponentFactory();

            if (tag.name == defs.process)
                return new ProcessNoteTagDataComponentFactory();

            if (tag.name == defs.processAvailability)
                return new ProcessAvailabilityNoteTagDataComponentFactory();

            if (tag.name == defs.cloneNoteProcess)
                return new CloneNoteProcessNoteTagDataComponentFactory();
        }

        if (
            tag.linksTo(this.process) &&
            !tag.isInternal &&
            !!tag.links.find(x => x.linksTo(this.process))
        )
            return new CustomProcessNoteTagDataComponentFactory();

        return null;
    }
}