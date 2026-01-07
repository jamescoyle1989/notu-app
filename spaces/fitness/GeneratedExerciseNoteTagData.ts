import { Note, NoteTag, Tag } from "notu";
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
        this.difficulty = this.difficulty;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new GeneratedExerciseData(noteTag);
    }
    static addTag(note: Note, exercise: Tag): GeneratedExerciseData {
        return new GeneratedExerciseData(note.addTag(exercise));
    }

    get difficulty(): number { return this._nt.data.difficulty; }
    set difficulty(value: number) {
        value = Math.round(value ?? 1);
        value = Math.min(Math.max(1, value), 6);
        if (this._nt.data.difficulty != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.difficulty = value;
    }

    get description(): string {
        return GeneratedExerciseData.valueToDescription(this.difficulty);
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

    get isEasy(): boolean { return this.difficulty == 1; }
    asEasy(): GeneratedExerciseData {
        this.difficulty = 1;
        return this;
    }

    get isModeratelyEasy(): boolean { return this.difficulty == 2; }
    asModeratelyEasy(): GeneratedExerciseData {
        this.difficulty = 2;
        return this;
    }

    get isModerate(): boolean { return this.difficulty == 3; }
    asModerate(): GeneratedExerciseData {
        this.difficulty = 3;
        return this;
    }

    get isModeratelyHard(): boolean { return this.difficulty == 4; }
    asModeratelyHard(): GeneratedExerciseData {
        this.difficulty = 4;
        return this;
    }

    get isHard(): boolean { return this.difficulty == 5; }
    asHard(): GeneratedExerciseData {
        this.difficulty = 5;
        return this;
    }

    get isFailed(): boolean { return this.difficulty == 6; }
    asFailed(): GeneratedExerciseData {
        this.difficulty = 6;
        return this;
    }
}