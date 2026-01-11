import { Note, NoteTag } from "notu";
import { CommonSpace } from "../common/CommonSpace";
import { CommonSpaceSetup } from "../common/CommonSpaceSetup";

export class ImportTransactionsProcessData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.process ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
        ) {
            throw Error(`Attempted to create a note tag data helper for a notetag that it does not support`);
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.saveTransactionsToSpaceId = this.saveTransactionsToSpaceId;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new ImportTransactionsProcessData(noteTag);
    }
    static addTag(note: Note, commonSpace: CommonSpace): ImportTransactionsProcessData {
        return new ImportTransactionsProcessData(note.addTag(commonSpace.process));
    }

    get saveTransactionsToSpaceId(): number { return this._nt.data.saveTransactionsToSpaceId; }
    set saveTransactionsToSpaceId(value: number) {
        if (this._nt.data.saveTransactionsToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveTransactionsToSpaceId = value;
    }
}