import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import ExerciseMetricDefNoteTagDataComponentFactory from "./ExerciseMetricDefNoteTagDataComponent";
import ExerciseNoteTagDataComponentFactory from "./ExerciseNoteTagDataComponent";
import { FitnessSpaceSetup } from "./FitnessSpaceSetup";
import MetricNoteTagDataComponentFactory from "./MetricNoteTagDataComponent";
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


    buildNoteActionsMenu(
        note: Note,
        menuBuilder: NoteActionsMenuBuilder,
        notu: Notu
    ) {
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
        )
            return new ExerciseMetricDefNoteTagDataComponentFactory();

        return null;
    }
}