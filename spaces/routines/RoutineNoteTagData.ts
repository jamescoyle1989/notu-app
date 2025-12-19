import { Note, NoteTag } from "notu";
import { RoutinesSpace } from "./RoutinesSpace";
import { RoutinesSpaceSetup } from "./RoutinesSpaceSetup";

export class RoutineData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != RoutinesSpaceSetup.routine ||
            noteTag.tag.space.internalName != RoutinesSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.canBeCompressed = this.canBeCompressed;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new RoutineData(noteTag);
    }
    static addTag(note: Note, routinesSpace: RoutinesSpace): RoutineData {
        return new RoutineData(note.addTag(routinesSpace.routine));
    }

    get canBeCompressed(): boolean {
        return !!this._nt.data.canBeCompressed;
    }
    set canBeCompressed(value: boolean) {
        if (!!this._nt.data.canBeCompressed != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.canBeCompressed = value;
    }
}