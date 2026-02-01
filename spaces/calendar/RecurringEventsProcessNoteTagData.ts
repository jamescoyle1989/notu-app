import { Note, NoteTag } from "notu";
import { ProcessDataBase } from "../processes/ProcessNoteTagDataBaseClass";
import { CalendarSpace } from "./CalendarSpace";
import { CalendarSpaceSetup } from "./CalendarSpaceSetup";

export class RecurringEventsProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CalendarSpaceSetup.recurringEventsProcess ||
            noteTag.tag.space.internalName != CalendarSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
        this.saveEventsToSpaceId = this.saveEventsToSpaceId;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new RecurringEventsProcessData(noteTag);
    }
    static addTag(note: Note, calendarSpace: CalendarSpace): RecurringEventsProcessData {
        return new RecurringEventsProcessData(note.addTag(calendarSpace.recurringEventsProcess));
    }

    get saveEventsToSpaceId(): number { return this._nt.data.saveEventsToSpaceId; }
    set saveEventsToSpaceId(value: number) {
        if (this._nt.data.saveEventsToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveEventsToSpaceId = value;
    }
}