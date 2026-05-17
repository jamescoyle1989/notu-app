import { mapDateToNumber, mapNumberToDate } from "@/sqlite/SQLMappings";
import dayjs from "dayjs";
import { Note, NoteTag, Tag } from "notu";
import { PeopleSpaceSetup } from "./PeopleSpaceSetup";

export class PersonCelebrationData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            !noteTag.tag.links.find(x => 
                x.name == PeopleSpaceSetup.celebration &&
                x.space.internalName == PeopleSpaceSetup.internalName
            )
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.date = this.date;
        this.planDaysAhead = this.planDaysAhead;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new PersonCelebrationData(noteTag);
    }
    static addTag(note: Note, celebration: Tag): PersonCelebrationData {
        return new PersonCelebrationData(note.addTag(celebration));
    }

    get date(): Date | null {
        if (!this._nt.data.date)
            return null;
        return mapNumberToDate(this._nt.data.date);
    }
    set date(value: Date | null) {
        let newVal: number = null;
        if (!!value)
            newVal = mapDateToNumber(dayjs(value).startOf('day').add(12, 'hours').toDate());
        if (this._nt.data.date != newVal && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.date = newVal;
    }

    get planDaysAhead(): number | null { return this._nt.data.planDaysAhead ?? null; }
    set planDaysAhead(value: number | null) {
        value = value ?? null;
        if (this._nt.data.planDaysAhead != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.planDaysAhead = value;
    }
}