import { NoteAction, NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, NoteTag, Notu, Space, Tag } from "notu";
import { CommonSpaceSetup } from "../common/CommonSpaceSetup";
import { LogicalSpace } from "../LogicalSpace";
import ExerciseMetricDefNoteTagDataComponentFactory from "./ExerciseMetricDefNoteTagDataComponent";
import ExerciseMetricNoteTagDataComponentFactory from "./ExerciseMetricNoteTagDataComponent";
import ExerciseNoteTagDataComponentFactory from "./ExerciseNoteTagDataComponent";
import { FitnessSpaceSetup } from "./FitnessSpaceSetup";
import GeneratedExerciseNoteTagDataComponentFactory from "./GeneratedExerciseNoteTagDataComponent";
import { generateWorkout, GenerateWorkoutProcessContext } from "./GenerateWorkoutProcess";
import GenerateWorkoutProcessNoteTagDataComponentFactory from "./GenerateWorkoutProcessNoteTagDataComponent";
import { showProcessOutputScreen } from "./GenerateWorkoutProcessUI";
import MetricNoteTagDataComponentFactory from "./MetricNoteTagDataComponent";
import WorkoutExerciseNoteTagDataComponentFactory from "./WorkoutExerciseNoteTagDataComponent";
import WorkoutNoteTagDataComponentFactory from "./WorkoutNoteTagDataComponent";

export class FitnessSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _metric: Tag;
    get metric(): Tag { return this._metric; }

    private _workout: Tag; 
    get workout(): Tag { return this._workout; }

    private _exercise: Tag;
    get exercise(): Tag { return this._exercise; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(FitnessSpaceSetup.internalName);
        this._metric = notu.getTagByName(FitnessSpaceSetup.metric, this._space);
        this._workout = notu.getTagByName(FitnessSpaceSetup.workout, this._space);
        this._exercise = notu.getTagByName(FitnessSpaceSetup.exercise, this._space);
    }


    async setup(notu: Notu): Promise<void> {
        await FitnessSpaceSetup.setup(notu);
        this._load(notu);
    }


    getMetrics(note: Note): Array<NoteTag> {
        const output = new Array<NoteTag>();
        for (const nt of note.tags) {
            if (nt.tag.linksTo(this.metric))
                output.push(nt);
        }
        return output;
    }


    buildNoteActionsMenu(
        note: Note,
        menuBuilder: NoteActionsMenuBuilder,
        notu: Notu
    ) {
        if (!!note.getTag(this.workout)) {
            menuBuilder.addToTopOfEnd(
                new NoteAction('Generate Workout Exercises',
                    async () => {
                        try {
                            const newNoteOptions = await generateWorkout(note,
                                new GenerateWorkoutProcessContext(notu)
                            );
                            return showProcessOutputScreen(note, newNoteOptions, notu);
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                )
            )
        }
    }


    resolveNoteTagDataComponentFactory(
        tag: Tag,
        note: Note
    ): NoteTagDataComponentFactory | null {
        
        if (tag.space.internalName == FitnessSpaceSetup.internalName) {
            if (tag.name == FitnessSpaceSetup.metric)
                return new MetricNoteTagDataComponentFactory();

            if (tag.name == FitnessSpaceSetup.exercise)
                return new ExerciseNoteTagDataComponentFactory();

            if (tag.name == FitnessSpaceSetup.workout)
                return new WorkoutNoteTagDataComponentFactory();
        }

        if (
            tag.linksTo(this.metric) &&
            !!note.tags.find(x => x.tag.id == this.exercise.id)
        ) {
            return new ExerciseMetricDefNoteTagDataComponentFactory();
        }
        
        if (
            tag.linksTo(this.exercise) &&
            !!note.tags.find(x => x.tag.id == this.workout.id)
        ) {
            return new WorkoutExerciseNoteTagDataComponentFactory();
        }

        if (
            tag.linksTo(this.exercise) &&
            !note.tags.find(x => x.tag.id == this.workout.id)
        ) {
            return new GeneratedExerciseNoteTagDataComponentFactory();
        }

        if (
            tag.linksTo(this.metric) &&
            !note.tags.find(x => x.tag.id == this.exercise.id) &&
            !note.tags.find(x => x.tag.id == this.workout.id)
        ) {
            return new ExerciseMetricNoteTagDataComponentFactory();
        }

        if (
            tag.space.internalName == CommonSpaceSetup.internalName &&
            tag.name == CommonSpaceSetup.process &&
            note.ownTag?.isInternal &&
            note.ownTag?.name == FitnessSpaceSetup.generateWorkoutProcess
        )
            return new GenerateWorkoutProcessNoteTagDataComponentFactory();

        return null;
    }
}