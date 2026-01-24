import { Note, NoteTag } from "notu";
import { ProcessesSpace } from "../processes/ProcessesSpace";
import { ProcessesSpaceSetup } from "../processes/ProcessesSpaceSetup";

export class GenerateRoutinesProcessData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != ProcessesSpaceSetup.process ||
            noteTag.tag.space.internalName != ProcessesSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support.');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.saveNotesToSpaceId = this.saveNotesToSpaceId;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new GenerateRoutinesProcessData(noteTag);
    }
    static addTag(note: Note, processesSpace: ProcessesSpace): GenerateRoutinesProcessData {
        return new GenerateRoutinesProcessData(note.addTag(processesSpace.process));
    }

    get saveNotesToSpaceId(): number { return this._nt.data.saveNotesToSpaceId; }
    set saveNotesToSpaceId(value: number) {
        if (this._nt.data.saveNotesToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveNotesToSpaceId = value;
    }
}