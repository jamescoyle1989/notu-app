import { Note, NoteTag } from "notu";
import { ProcessesSpace } from "../processes/ProcessesSpace";
import { ProcessesSpaceSetup } from "../processes/ProcessesSpaceSetup";

export class CelebrationEventsProcessData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != ProcessesSpaceSetup.process ||
            noteTag.tag.space.internalName != ProcessesSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.saveEventsToSpaceId = this.saveEventsToSpaceId;
        this.savePlanTasksToSpaceId = this.savePlanTasksToSpaceId;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new CelebrationEventsProcessData(noteTag);
    }
    static addTag(note: Note, processesSpace: ProcessesSpace): CelebrationEventsProcessData {
        return new CelebrationEventsProcessData(note.addTag(processesSpace.process));
    }

    get saveEventsToSpaceId(): number { return this._nt.data.saveEventsToSpaceId; }
    set saveEventsToSpaceId(value: number) {
        if (this._nt.data.saveEventsToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveEventsToSpaceId = value;
    }

    get savePlanTasksToSpaceId(): number { return this._nt.data.savePlanTasksToSpaceId; }
    set savePlanTasksToSpaceId(value: number) {
        if (this._nt.data.savePlanTasksToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.savePlanTasksToSpaceId = value;
    }
}