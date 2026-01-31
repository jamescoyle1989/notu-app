import { Note, NoteTag } from "notu";
import { ProcessesSpace } from "./ProcessesSpace";
import { ProcessesSpaceSetup } from "./ProcessesSpaceSetup";

export class ProcessData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != ProcessesSpaceSetup.process ||
            noteTag.tag.space.internalName != ProcessesSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.name = this.name;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new ProcessData(noteTag);
    }
    static addTag(note: Note, processesSpace: ProcessesSpace): ProcessData {
        return new ProcessData(note.addTag(processesSpace.process));
    }

    get name(): string { return this._nt.data.name; }
    set name(value: string) {
        value = value ?? '';
        if (this._nt.data.name != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.name = value;
    }
}