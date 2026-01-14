import { Note, NoteTag } from "notu";
import { MoneySpace } from "./MoneySpace";
import { MoneySpaceSetup } from "./MoneySpaceSetup";

export class BudgetData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != MoneySpaceSetup.budget ||
            noteTag.tag.space.internalName != MoneySpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.transactionQuery = this.transactionQuery;
        this.flipGraphDirection = this.flipGraphDirection;
        this.timeUnit = this.timeUnit;
        this.movingAveragePeriods = this.movingAveragePeriods;
        this.minAmount = this.minAmount;
        this.targetAmount = this.targetAmount;
        this.maxAmount = this.maxAmount;
        this.maxDaysHistory = this.maxDaysHistory;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new BudgetData(noteTag);
    }
    static addTag(note: Note, moneySpace: MoneySpace): BudgetData {
        return new BudgetData(note.addTag(moneySpace.budget));
    }

    get transactionQuery(): string { return this._nt.data.transactionQuery; }
    set transactionQuery(value: string) {
        value = value ?? '';
        if (this._nt.data.transactionQuery != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.transactionQuery = value;
    }

    get flipGraphDirection(): boolean { return this._nt.data.flipGraphDirection; }
    set flipGraphDirection(value: boolean) {
        value = value ?? false;
        if (this._nt.data.flipGraphDirection != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.flipGraphDirection = value;
    }

    get timeUnit(): 'Days' | 'Weeks' | 'Months' | 'Years' { return this._nt.data.timeUnit; }
    set timeUnit(value: 'Days' | 'Weeks' | 'Months' | 'Years') {
        value = value ?? 'Days';
        if (this._nt.data.timeUnit != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.timeUnit = value;
    }

    get movingAveragePeriods(): number { return this._nt.data.movingAveragePeriods; }
    set movingAveragePeriods(value: number) {
        value = Math.max(0, value ?? 0);
        if (this._nt.data.movingAveragePeriods != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.movingAveragePeriods = value;
    }

    get minAmount(): number { return this._nt.data.minAmount; }
    set minAmount(value: number) {
        value = value ?? null;
        if (this._nt.data.minAmount != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.minAmount = value;
    }

    get targetAmount(): number { return this._nt.data.targetAmount; }
    set targetAmount(value: number) {
        value = value ?? null;
        if (this._nt.data.targetAmount != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.targetAmount = value;
    }

    get maxAmount(): number { return this._nt.data.maxAmount; }
    set maxAmount(value: number) {
        value = value ?? null;
        if (this._nt.data.maxAmount != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.maxAmount = value;
    }

    get maxDaysHistory(): number { return this._nt.data.maxDaysHistory; }
    set maxDaysHistory(value: number) {
        value = value ?? null;
        if (this._nt.data.maxDaysHistory != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.maxDaysHistory = value;
    }
}