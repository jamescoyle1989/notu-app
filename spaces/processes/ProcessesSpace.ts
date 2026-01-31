import { NoteAction, NoteActionsMenuBuilder, ShowEditorAction } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import CreateNoteProcessNoteTagDataComponentFactory from "./CreateNoteProcessNoteTagDataComponent";
import ProcessAvailabilityNoteTagDataComponentFactory from "./ProcessAvailabilityNoteTagDataComponent";
import { ProcessesSpaceSetup } from "./ProcessesSpaceSetup";
import ProcessNoteTagDataComponentFactory from "./ProcessNoteTagDataComponent";

export class ProcessesSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

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
        this._space = notu.getSpaceByInternalName(ProcessesSpaceSetup.internalName);
        this._process = notu.getTagByName(ProcessesSpaceSetup.process, this._space);
        this._processAvailability = notu.getTagByName(ProcessesSpaceSetup.processAvailability, this._space);
        this._createNoteProcess = notu.getTagByName(ProcessesSpaceSetup.createNoteProcess, this._space);
        this._editNoteProcess = notu.getTagByName(ProcessesSpaceSetup.editNoteProcess, this._space);
        this._deleteNoteProcess = notu.getTagByName(ProcessesSpaceSetup.deleteNoteProcess, this._space);
    }

    
    async setup(notu: Notu): Promise<void> {
        await ProcessesSpaceSetup.setup(notu);
        this._load(notu);
    }


    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
        if (note.ownTag?.isInternal == true && !!note.getTag(this.process)) {
            menuBuilder.addToTopOfStart(
                new NoteAction('Edit',
                    () => Promise.resolve(new ShowEditorAction(note))
                )
            );
        }
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        if (tag.space.internalName == ProcessesSpaceSetup.internalName) {
            if (tag.name == ProcessesSpaceSetup.createNoteProcess)
                return new CreateNoteProcessNoteTagDataComponentFactory();

            if (tag.name == ProcessesSpaceSetup.process)
                return new ProcessNoteTagDataComponentFactory();

            if (tag.name == ProcessesSpaceSetup.processAvailability)
                return new ProcessAvailabilityNoteTagDataComponentFactory();
        }
        return null;
    }
}