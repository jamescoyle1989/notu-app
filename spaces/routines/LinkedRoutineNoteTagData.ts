import { Note, NoteTag, Tag } from "notu";
import { RoutinesSpaceSetup } from "./RoutinesSpaceSetup";


export type RoutineRelationType = 
    'Forces Routine Due' | 
    'Must Be Due On Same Day' | 
    'Must Not Be Due On Same Day' | 
    'Is Treated As Equivalent';


export class LinkedRoutineData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            !noteTag.tag.links.find(x =>
                x.name == RoutinesSpaceSetup.routine &&
                x.space.internalName == RoutinesSpaceSetup.internalName
            )
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.relationship = this.relationship;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new LinkedRoutineData(noteTag);
    }
    static addTag(note: Note, routine: Tag): LinkedRoutineData {
        return new LinkedRoutineData(note.addTag(routine));
    }

    get relationship(): RoutineRelationType {
        return this._nt.data.relationship ?? 'Forces Routine Due';
    }
    set relationship(value: RoutineRelationType) {
        value = value ?? 'Forces Routine Due';
        if (this._nt.data.relationship != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.relationship = value;
    }
}