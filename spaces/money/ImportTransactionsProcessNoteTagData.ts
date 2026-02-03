import { UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "../processes/ProcessNoteTagDataBaseClass";
import { ImportTransactionProcessContext, importTransactions } from "./ImportTransactionsProcess";
import { showProcessOutputScreen } from "./ImportTransactionsProcessUI";
import { MoneySpace } from "./MoneySpace";
import { MoneySpaceSetup } from "./MoneySpaceSetup";

export class ImportTransactionsProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != MoneySpaceSetup.importTransactionsProcess ||
            noteTag.tag.space.internalName != MoneySpaceSetup.internalName
        ) {
            throw Error(`Attempted to create a note tag data helper for a notetag that it does not support`);
        }
        super(noteTag);
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

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const moneySpace = new MoneySpace(notu);
        const newNoteOptions = await importTransactions(
            note,
            new ImportTransactionProcessContext(
                note.getTagData(moneySpace.importTransactionsProcess, ImportTransactionsProcessData),
                notu
            )
        );
        return showProcessOutputScreen(note, newNoteOptions, notu);
    }
}