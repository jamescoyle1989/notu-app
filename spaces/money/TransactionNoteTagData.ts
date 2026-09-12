import { areArraysDifferent } from "@/helpers/RenderHelpers";
import { Note, NoteTag } from "notu";
import { mapDateToNumber, mapNumberToDate } from "../../sqlite/SQLMappings";
import { MoneySpace } from "./MoneySpace";
import { MoneySpaceSetup } from "./MoneySpaceSetup";

export class TransactionData {
    private _nt: NoteTag;
    private _isLoading = true;
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
        this.alternativeDescriptions = this.alternativeDescriptions;
        this.effectiveStart = this.effectiveStart;
        this.effectiveEnd = this.effectiveEnd;
        this.confirmed = this.confirmed;
        this._isLoading = false;
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

    get alternativeDescriptions(): Array<string> { return this._nt.data.alternativeDescriptions; }
    set alternativeDescriptions(value: Array<string>) {
        value = value ?? [];
        if (areArraysDifferent<string>(value, this._nt.data.alternativeDescriptions) && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.alternativeDescriptions = value;
    }

    get effectiveStart(): Date {
        if (!this._nt.data.effectiveStart)
            return null;
        return mapNumberToDate(this._nt.data.effectiveStart);
    }
    set effectiveStart(value: Date) {
        let newVal = mapDateToNumber(value ?? new Date());
        if (this._nt.data.effectiveStart != newVal && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.effectiveStart = newVal;
        if (!this._isLoading) {
            const endVal = mapDateToNumber(this.effectiveEnd);
            if (endVal < newVal)
                this.effectiveEnd = this.effectiveStart;
        }
    }

    get effectiveEnd(): Date {
        if (!this._nt.data.effectiveEnd)
            return null;
        return mapNumberToDate(this._nt.data.effectiveEnd);
    }
    set effectiveEnd(value: Date) {
        let newVal = mapDateToNumber(value ?? new Date());
        if (this._nt.data.effectiveEnd != newVal && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.effectiveEnd = newVal;
        if (!this._isLoading) {
            const startVal = mapDateToNumber(this.effectiveStart);
            if (startVal > newVal)
                this.effectiveStart = this.effectiveEnd;
        }
    }

    get confirmed(): boolean { return this._nt.data.confirmed; }
    set confirmed(value: boolean) {
        value = value ?? false;
        if (this._nt.data.confirmed != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.confirmed = value;
    }
}