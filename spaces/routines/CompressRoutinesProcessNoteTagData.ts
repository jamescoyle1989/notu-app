import { Note, NoteTag } from "notu";
import { CommonSpace } from "../common/CommonSpace";
import { CommonSpaceSetup } from "../common/CommonSpaceSetup";

export class CompressRoutinesProcessData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.process ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
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
        return new CompressRoutinesProcessData(noteTag);
    }
    static addTag(note: Note, commonSpace: CommonSpace): CompressRoutinesProcessData {
        return new CompressRoutinesProcessData(note.addTag(commonSpace.process));
    }

    get saveNotesToSpaceId(): number { return this._nt.data.saveNotesToSpaceId; }
    set saveNotesToSpaceId(value: number) {
        if (this._nt.data.saveNotesToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveNotesToSpaceId = value;
    }
}