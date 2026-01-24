import { Note, NoteTag } from "notu";
import { ProcessesSpace } from "../processes/ProcessesSpace";
import { ProcessesSpaceSetup } from "../processes/ProcessesSpaceSetup";

export class GenerateWorkoutProcessData {
    private _nt:NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != ProcessesSpaceSetup.process ||
            noteTag.tag.space.internalName != ProcessesSpaceSetup.internalName
        ) {
            throw Error(`Attempted to create a note tag data helper for a notetag that it does not support`);
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.saveExercisesToSpaceId = this.saveExercisesToSpaceId;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new GenerateWorkoutProcessData(noteTag);
    }
    static addTag(note: Note, processesSpace: ProcessesSpace): GenerateWorkoutProcessData {
        return new GenerateWorkoutProcessData(note.addTag(processesSpace.process));
    }

    get saveExercisesToSpaceId(): number { return this._nt.data.saveExercisesToSpaceId; }
    set saveExercisesToSpaceId(value: number) {
        if (this._nt.data.saveExercisesToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveExercisesToSpaceId = value;
    }
}