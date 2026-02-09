import { Note, NoteTag } from "notu";
import { SystemSpace } from "./SystemSpace";
import { SystemSpaceSetup } from "./SystemSpaceSetup";

export class ProcessAvailabilityData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != SystemSpaceSetup.processAvailability ||
            noteTag.tag.space.internalName != SystemSpaceSetup.internalName
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
    static addTag(note: Note, systemSpace: SystemSpace): ProcessAvailabilityData {
        return new ProcessAvailabilityData(note.addTag(systemSpace.processAvailability));
    }

    get query(): string { return this._nt.data.query; }
    set query(value: string) {
        value = value ?? '';
        if (this._nt.data.query != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.query = value;
    }
}