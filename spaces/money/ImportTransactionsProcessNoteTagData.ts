import { Note, NoteTag } from "notu";
import { MoneySpace } from "./MoneySpace";
import { MoneySpaceSetup } from "./MoneySpaceSetup";

export class ImportTransactionsProcessData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != MoneySpaceSetup.importTransactionsProcess ||
            noteTag.tag.space.internalName != MoneySpaceSetup.internalName
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
    static addTag(note: Note, moneySpace: MoneySpace): ImportTransactionsProcessData {
        return new ImportTransactionsProcessData(note.addTag(moneySpace.importTransactionsProcess));
    }

    get saveTransactionsToSpaceId(): number { return this._nt.data.saveTransactionsToSpaceId; }
    set saveTransactionsToSpaceId(value: number) {
        if (this._nt.data.saveTransactionsToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveTransactionsToSpaceId = value;
    }
}