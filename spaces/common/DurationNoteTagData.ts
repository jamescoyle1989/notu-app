import { Note, NoteTag } from "notu";
import { CommonSpace } from "./CommonSpace";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class DurationData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.duration ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.ms = this.ms;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new DurationData(noteTag);
    }
    static addTag(note: Note, commonSpace: CommonSpace): DurationData {
        return new DurationData(note.addTag(commonSpace.duration));
    }

    get ms(): number { return this._nt.data.ms; }
    set ms(value: number) {
        value = Math.max(0, value ?? 0);
        if (this._nt.data.ms != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.ms = value;
    }

    get totalSeconds(): number { return Math.round(this.ms / 1000); }

    get seconds(): number { return this.totalSeconds - (this.totalMinutes * 60); }

    get totalMinutes(): number { return Math.floor(this.totalSeconds / 60); }

    get minutes(): number { return this.totalMinutes - (this.totalHours * 60);  }

    get totalHours(): number { return Math.floor(this.totalMinutes / 60); }

    get hours(): number { return this.totalHours - (this.totalDays * 24); }

    get totalDays(): number { return Math.floor(this.totalHours / 24); }

    set(days: number = 0, hours: number = 0, minutes: number = 0, seconds: number = 0, ms: number = 0) {
        const totalHours = (days * 24) + hours;
        const totalMinutes = (totalHours * 60) + minutes;
        const totalSeconds = (totalMinutes * 60) + seconds;
        const totalMs = (totalSeconds * 1000) + ms;
        this.ms = totalMs;
    }
}