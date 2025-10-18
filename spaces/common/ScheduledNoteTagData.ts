import dayjs from "dayjs";
import { Note, NoteTag } from "notu";
import { CommonSpace } from "./CommonSpace";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class ScheduledData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.scheduled ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.includeTime = this.includeTime;
        this.start = this.start;
        this.durationMs = this.durationMs;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new ScheduledData(noteTag);
    }
    static addTag(note: Note, commonSpace: CommonSpace): ScheduledData {
        return new ScheduledData(note.addTag(commonSpace.scheduled));
    }

    get includeTime(): boolean { return this._nt.data.includeTime; }
    set includeTime(value: boolean) {
        value = value ?? false;
        if (this._nt.data.includeTime != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.includeTime = value;
        this.start = this.start;
    }

    get start(): Date {
        if (!this._nt.data.start)
            return null;
        return new Date(this._nt.data.start);
    }
    set start(value: Date) {
        value = value ?? new Date();
        if (!this.includeTime)
            value = dayjs(value).hour(12).startOf('hour').toDate();
        let newVal = (value).toISOString();
        if (this._nt.data.start != newVal && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.start = newVal;
    }

    get durationMs(): number { return this._nt.data.durationMs; }
    set durationMs(value: number) {
        value = Math.max(0, value ?? 0);
        if (this._nt.data.durationMs != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.durationMs = value;
    }

    get end(): Date {
        return new Date(this.start.getTime() + this.durationMs);
    }
    set end(value: Date) {
        value = value ?? new Date();
        this.durationMs = value.getTime() - this.start.getTime();
    }
}