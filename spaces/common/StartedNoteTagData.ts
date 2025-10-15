import { Note, NoteTag } from "notu";
import { CommonSpace } from "./CommonSpace";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class StartedData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.started ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.date = this.date;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new StartedData(noteTag);
    }
    static addTag(note: Note, commonSpace: CommonSpace): StartedData {
        return new StartedData(note.addTag(commonSpace.started));
    }

    get date(): Date {
        if (!this._nt.data.date)
            return null;
        return new Date (this._nt.data.date);
    }
    set date(value: Date) {
        let newVal = (value ?? new Date()).toISOString();
        if (this._nt.data.date != newVal && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.date = newVal;
    }
}