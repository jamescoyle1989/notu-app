import { Note, NoteTag } from "notu";
import { ProcessesSpace } from "./ProcessesSpace";
import { ProcessesSpaceSetup } from "./ProcessesSpaceSetup";
import { ProcessData } from "./ProcessNoteTagData";

export class ProcessAvailabilityData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != ProcessesSpaceSetup.processAvailability ||
            noteTag.tag.space.internalName != ProcessesSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.query = this.query;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new ProcessAvailabilityData(noteTag);
    }
    static addTag(note: Note, processesSpace: ProcessesSpace): ProcessData {
        return new ProcessData(note.addTag(processesSpace.processAvailability));
    }

    get query(): string { return this._nt.data.query; }
    set query(value: string) {
        value = value ?? '';
        if (this._nt.data.query != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.query = value;
    }
}