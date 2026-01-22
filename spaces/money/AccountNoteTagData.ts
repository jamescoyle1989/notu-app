import { Note, NoteTag } from "notu";
import { MoneySpace } from "./MoneySpace";
import { MoneySpaceSetup } from "./MoneySpaceSetup";

export class AccountData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != MoneySpaceSetup.account ||
            noteTag.tag.space.internalName != MoneySpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.importType = this.importType;
        this.fileImportMapping = this.fileImportMapping;
        this.settlementDays = this.settlementDays;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new AccountData(noteTag);
    }
    static addTag(note: Note, moneySpace: MoneySpace): AccountData {
        return new AccountData(note.addTag(moneySpace.account));
    }

    get importType(): 'CSV' | 'Manual' { return this._nt.data.importType; }
    set importType(value: 'CSV' | 'Manual') {
        value = value ?? 'CSV';
        if (this._nt.data.importType != value) {
            if (value == 'CSV') {
                this.fileImportMapping = '';
                this.settlementDays = 0;
            }
            else
                this.fileImportMapping = null;
            if (this._nt.isClean)
                this._nt.dirty();
        }
        this._nt.data.importType = value;
    }

    get fileImportMapping(): string { return this._nt.data.fileImportMapping; }
    set fileImportMapping(value: string) {
        value = value ?? null;
        if (this._nt.data.fileImportMapping != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.fileImportMapping = value;
    }

    get settlementDays(): number { return this._nt.data.settlementDays; }
    set settlementDays(value: number) {
        value = value ?? 0;
        if (this._nt.data.settlementDays != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.settlementDays = value;
    }
}