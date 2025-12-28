import { Note, NoteTag } from "notu";
import { CommonSpace } from "../common/CommonSpace";
import { CommonSpaceSetup } from "../common/CommonSpaceSetup";

export class RecurringEventsProcessData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.process ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.saveEventsToSpaceId = this.saveEventsToSpaceId;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new RecurringEventsProcessData(noteTag);
    }
    static addTag(note: Note, commonSpace: CommonSpace): RecurringEventsProcessData {
        return new RecurringEventsProcessData(note.addTag(commonSpace.process));
    }

    get saveEventsToSpaceId(): number { return this._nt.data.saveEventsToSpaceId; }
    set saveEventsToSpaceId(value: number) {
        if (this._nt.data.saveEventsToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveEventsToSpaceId = value;
    }
}