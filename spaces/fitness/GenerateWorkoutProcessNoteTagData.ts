import { UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "../system/ProcessNoteTagDataBaseClass";
import { FitnessSpace } from "./FitnessSpace";
import { FitnessSpaceSetup } from "./FitnessSpaceSetup";
import { generateWorkout, GenerateWorkoutProcessContext } from "./GenerateWorkoutProcess";
import { showProcessOutputScreen } from "./GenerateWorkoutProcessUI";

export class GenerateWorkoutProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != FitnessSpaceSetup.generateWorkoutProcess ||
            noteTag.tag.space.internalName != FitnessSpaceSetup.internalName
        ) {
            throw Error(`Attempted to create a note tag data helper for a notetag that it does not support`);
        }
        super(noteTag);
        this.saveExercisesToSpaceId = this.saveExercisesToSpaceId;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new GenerateWorkoutProcessData(noteTag);
    }
    static addTag(note: Note, fitnessSpace: FitnessSpace): GenerateWorkoutProcessData {
        return new GenerateWorkoutProcessData(note.addTag(fitnessSpace.generateWorkoutProcess));
    }

    get saveExercisesToSpaceId(): number { return this._nt.data.saveExercisesToSpaceId; }
    set saveExercisesToSpaceId(value: number) {
        if (this._nt.data.saveExercisesToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveExercisesToSpaceId = value;
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const fitnessSpace = new FitnessSpace(notu);
        const newNoteOptions = await generateWorkout(
            note,
            new GenerateWorkoutProcessContext(
                note.getTagData(fitnessSpace.generateWorkoutProcess, GenerateWorkoutProcessData),
                notu
            )
        );
        return showProcessOutputScreen(note, newNoteOptions, notu);
    }
}