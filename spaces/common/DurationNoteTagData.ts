import { Note, NoteTag } from "notu";
import { CommonSpace } from "./CommonSpace";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class DurationData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.duration ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.ms = this.ms;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new DurationData(noteTag);
    }
    static addTag(note: Note, commonSpace: CommonSpace): DurationData {
        return new DurationData(note.addTag(commonSpace.duration));
    }

    get ms(): number { return this._nt.data.ms; }
    set ms(value: number) {
        value = Math.max(0, value ?? 0);
        if (this._nt.data.ms != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.ms = value;
    }
}