import { areArraysDifferent } from "@/helpers/RenderHelpers";
import dayjs from "dayjs";
import { last } from "es-toolkit";
import { Note, NoteTag } from "notu";
import { CommonSpace } from "./CommonSpace";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class RecurringData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.recurring ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.timeOfDay = this.timeOfDay;
        this.daysOfWeek = this.daysOfWeek;
        this.daysOfMonth = this.daysOfMonth;
        this.monthsOfYear = this.monthsOfYear;
        this.daysPerCycle = this.daysPerCycle;
        this.timesPerCycle = this.timesPerCycle;
        this.minDaysBetween = this.minDaysBetween;
        this.daysLookahead = this.daysLookahead;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new RecurringData(noteTag);
    }
    static addTag(note: Note, commonSpace: CommonSpace): RecurringData {
        return new RecurringData(note.addTag(commonSpace.recurring));
    }

    get timeOfDay(): Date {
        if (!this._nt.data.timeOfDay)
            return null;
        return new Date(this._nt.data.timeOfDay);
    }
    set timeOfDay(value: Date) {
        let newVal = (value ?? new Date()).toISOString();
        if (this._nt.data.timeOfDay != newVal && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.timeOfDay = newVal;
    }

    get daysOfWeek(): Array<number> { return this._nt.data.daysOfWeek; }
    set daysOfWeek(value: Array<number>) {
        value = value ?? null;
        if (value != null)
            value = value.map(x => Math.round(x)).filter(x => x >= 0 && x <= 6);
        if (areArraysDifferent(value, this._nt.data.daysOfWeek) && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.daysOfWeek = value;
    }

    get daysOfMonth(): Array<number> { return this._nt.data.daysOfMonth; }
    set daysOfMonth(value: Array<number>) {
        value = value ?? null;
        if (value != null)
            value = value.map(x => Math.round(x)).filter(x => x >= -31 && x <= 31 && x != 0);
        if (areArraysDifferent(value, this._nt.data.daysOfMonth) && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.daysOfMonth = value;
    }

    get monthsOfYear(): Array<number> { return this._nt.data.monthsOfYear; }
    set monthsOfYear(value: Array<number>) {
        value = value ?? null;
        if (value != null)
            value = value.map(x => Math.round(x)).filter(x => x >= 1 && x <= 12);
        if (areArraysDifferent(value, this._nt.data.monthsOfYear) && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.monthsOfYear = value;
    }

    get daysPerCycle(): number { return this._nt.data.daysPerCycle; }
    set daysPerCycle(value: number) {
        value = value ?? null;
        if (value != null)
            value = Math.max(1, Math.round(value));
        if (this._nt.data.daysPerCycle != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.daysPerCycle = value;
    }

    get timesPerCycle(): number { return this._nt.data.timesPerCycle; }
    set timesPerCycle(value: number) {
        value = value ?? null;
        if (value != null)
            value = Math.max(1, Math.round(value));
        if (this._nt.data.timesPerCycle != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.timesPerCycle = value;
    }

    get isCyclic(): boolean { return this.daysPerCycle != null && this.timesPerCycle != null; }

    get minDaysBetween(): number { return this._nt.data.minDaysBetween; }
    set minDaysBetween(value: number) {
        value = Math.max(0, Math.round(value ?? 0));
        if (this._nt.data.minDaysBetween != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.minDaysBetween = value;
    }

    get daysLookahead(): number { return this._nt.data.daysLookahead; }
    set daysLookahead(value: number) {
        value = value ?? 7;
        value = Math.max(0, Math.round(value));
        if (this._nt.data.daysLookahead != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.daysLookahead = value;
    }

    isDueOn(
        date: Date,
        history: Array<Date>
    ): boolean {
        const startOfDay = dayjs(date).startOf('day');
        const endOfDay = startOfDay.add(1, 'day').subtract(1, 'second');
        const djsHistory = history.map(x => dayjs(x));

        if (history.length > 0) {
            if (last(djsHistory).add(this.minDaysBetween, 'days').isAfter(endOfDay))
                return false;
        }

        if (this.timesPerCycle != null && this.daysPerCycle != null) {
            const lookback = djsHistory.filter(x => x.add(this.daysPerCycle, 'days').isAfter(endOfDay));
            if (lookback.length >= this.timesPerCycle)
                return false;
        }

        if (this.daysOfWeek != null && this.daysOfWeek.length > 0) {
            const dayOfWeek = startOfDay.day();
            if (!this.daysOfWeek.includes(dayOfWeek))
                return false;
        }

        if (this.daysOfMonth != null && this.daysOfMonth.length > 0) {
            const dayOfMonth = startOfDay.date();
            const daysToMonthEnd = startOfDay.daysInMonth() - dayOfMonth + 1;
            if (!this.daysOfMonth.includes(dayOfMonth) && !this.daysOfMonth.includes(-daysToMonthEnd))
                return false;
        }

        if (this.monthsOfYear != null && this.monthsOfYear.length > 0) {
            const month = startOfDay.month() + 1;
            if (!this.monthsOfYear.includes(month))
                return false;
        }

        return true;
    }
}