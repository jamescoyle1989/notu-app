import { Note, NoteTag } from "notu";
import { MoneySpace } from "./MoneySpace";
import { MoneySpaceSetup } from "./MoneySpaceSetup";

export class CurrencyData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != MoneySpaceSetup.currency ||
            noteTag.tag.space.internalName != MoneySpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.isBase = this.isBase;
        this.baseExchangeRate = this.baseExchangeRate;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new CurrencyData(noteTag);
    }
    static addTag(note: Note, moneySpace: MoneySpace): CurrencyData {
        return new CurrencyData(note.addTag(moneySpace.currency));
    }

    get isBase(): boolean { return this._nt.data.isBase; }
    set isBase(value: boolean) {
        value = value ?? false;
        if (this._nt.data.isBase != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.isBase = value;
    }

    get baseExchangeRate(): number { return this._nt.data.baseExchangeRate; }
    set baseExchangeRate(value: number) {
        value = value ?? 1;
        if (this._nt.data.baseExchangeRate != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.baseExchangeRate = value;
    }
}