import { Note, NoteTag } from "notu";
import { FitnessSpace } from "./FitnessSpace";
import { FitnessSpaceSetup } from "./FitnessSpaceSetup";

export class GeneratedExerciseData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            !noteTag.tag.links.find(x => 
                x.name == FitnessSpaceSetup.exercise &&
                x.space.internalName == FitnessSpaceSetup.internalName
            )
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.targetDifficulty = this.targetDifficulty;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new GeneratedExerciseData(noteTag);
    }
    static addTag(note: Note, fitnessSpace: FitnessSpace): GeneratedExerciseData {
        return new GeneratedExerciseData(note.addTag(fitnessSpace.exercise));
    }

    get targetDifficulty(): number { return this._nt.data.targetDifficulty; }
    set targetDifficulty(value: number) {
        value = value ?? 1;
        if (this._nt.data.targetDifficulty != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.targetDifficulty = value;
    }

    get description(): string {
        return GeneratedExerciseData.valueToDescription(this.targetDifficulty);
    }

    static valueToDescription(value: number): string {
        if (value < 1.5)
            return 'Easy';
        else if (value < 2.5)
            return 'Moderately Easy';
        else if (value < 3.5)
            return 'Moderate';
        else if (value < 4.5)
            return 'Moderately Hard';
        else if (value < 5.5)
            return 'Hard';
        else
            return 'Failed';
    }
}