import { Note, NoteTag } from "notu";
import { MoneySpace } from "./MoneySpace";
import { MoneySpaceSetup } from "./MoneySpaceSetup";

export class TransactionData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != MoneySpaceSetup.transaction ||
            noteTag.tag.space.internalName != MoneySpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.accountCurrencyAmount = this.accountCurrencyAmount;
        this.baseCurrencyAmount = this.baseCurrencyAmount;
        this.description = this.description;
        this.effectiveStart = this.effectiveStart;
        this.effectiveEnd = this.effectiveEnd;
        this.confirmed = this.confirmed;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new TransactionData(noteTag);
    }
    static addTag(note: Note, moneySpace: MoneySpace): TransactionData {
        return new TransactionData(note.addTag(moneySpace.transaction));
    }

    get accountCurrencyAmount(): number { return this._nt.data.accountCurrencyAmount; }
    set accountCurrencyAmount(value: number) {
        value = value ?? 0;
        if (this._nt.data.accountCurrencyAmount != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.accountCurrencyAmount = value;
    }

    get baseCurrencyAmount(): number { return this._nt.data.baseCurrencyAmount; }
    set baseCurrencyAmount(value: number) {
        value = value ?? 0;
        if (this._nt.data.baseCurrencyAmount != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.baseCurrencyAmount = value;
    }

    get description(): string { return this._nt.data.description; }
    set description(value: string) {
        value = value ?? '';
        if (this._nt.data.description != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.description = value;
    }

    get effectiveStart(): Date {
        if (!this._nt.data.effectiveStart)
            return null;
        return new Date(this._nt.data.effectiveStart);
    }
    set effectiveStart(value: Date) {
        let newVal = (value ?? new Date()).toISOString();
        if (this._nt.data.effectiveStart != newVal && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.effectiveStart = newVal;
    }

    get effectiveEnd(): Date {
        if (!this._nt.data.effectiveEnd)
            return null;
        return new Date(this._nt.data.effectiveEnd);
    }
    set effectiveEnd(value: Date) {
        let newVal = (value ?? new Date()).toISOString();
        if (this._nt.data.effectiveEnd != newVal && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.effectiveEnd = newVal;
    }

    get confirmed(): boolean { return this._nt.data.confirmed; }
    set confirmed(value: boolean) {
        value = value ?? false;
        if (this._nt.data.confirmed != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.confirmed = value;
    }
}