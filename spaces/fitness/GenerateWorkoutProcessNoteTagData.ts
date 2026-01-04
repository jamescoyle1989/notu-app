import { Note, NoteTag } from "notu";
import { CommonSpace } from "../common/CommonSpace";
import { CommonSpaceSetup } from "../common/CommonSpaceSetup";

export class GenerateWorkoutProcessData {
    private _nt:NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.process ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
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
    static addTag(note: Note, commonSpace: CommonSpace): GenerateWorkoutProcessData {
        return new GenerateWorkoutProcessData(note.addTag(commonSpace.process));
    }

    get saveExercisesToSpaceId(): number { return this._nt.data.saveExercisesToSpaceId; }
    set saveExercisesToSpaceId(value: number) {
        if (this._nt.data.saveExercisesToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveExercisesToSpaceId = value;
    }
}