import { NoteAction, NoteActionsMenuBuilder, RefreshAction, ShowEditorAction } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory, SpaceSettingsComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { CommonSpace } from "../common/CommonSpace";
import { LogicalSpace } from "../LogicalSpace";
import DeadlineNoteTagDataComponentFactory from "./DeadlineNoteTagDataComponent";
import { TasksSpaceSetup } from "./TasksSpaceSetup";

export class TasksSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _task: Tag;
    get task(): Tag { return this._task; }

    private _project: Tag;
    get project(): Tag { return this._project; }

    private _goal: Tag;
    get goal(): Tag { return this._goal; }

    private _deadline: Tag;
    get deadline(): Tag { return this._deadline; }

    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(TasksSpaceSetup.internalName);
        this._task = notu.getTagByName(TasksSpaceSetup.task, this._space);
        this._project = notu.getTagByName(TasksSpaceSetup.project, this._space);
        this._goal = notu.getTagByName(TasksSpaceSetup.goal, this._space);
        this._deadline = notu.getTagByName(TasksSpaceSetup.deadline, this._space);
    }


    async setup(notu: Notu): Promise<void> {
        await TasksSpaceSetup.setup(notu);
        this._load(notu);
    }


    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
        const commonSpace = new CommonSpace(notu);
        
        if (!!note.getTag(this.task) || !!note.getTag(this.project) || !!note.getTag(this.goal)) {
            if (!note.getTag(commonSpace.scheduled)) {
                menuBuilder.addToBottomOfMiddle(
                    new NoteAction('Schedule',
                        () => {
                            note.addTag(commonSpace.scheduled);
                            return Promise.resolve(new ShowEditorAction(note));
                        }
                    )
                )
            }
            if (!note.getTag(commonSpace.finished) && !note.getTag(commonSpace.cancelled)) {
                menuBuilder.addToBottomOfMiddle(
                    new NoteAction('Finish',
                        async () => {
                            note.addTag(commonSpace.finished);
                            note.removeTag(commonSpace.scheduled);
                            note.removeTag(this.deadline);
                            await notu.saveNotes([note]);
                            return new RefreshAction();
                        }
                    )
                )
                menuBuilder.addToBottomOfMiddle(
                    new NoteAction('Cancel',
                        async () => {
                            note.addTag(commonSpace.cancelled);
                            note.removeTag(commonSpace.scheduled);
                            note.removeTag(this.deadline);
                            await notu.saveNotes([note]);
                            return new RefreshAction();
                        }
                    )
                )
            }
        }
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        if (tag.name == TasksSpaceSetup.deadline)
            return new DeadlineNoteTagDataComponentFactory();
        return null;
    }


    getSpaceSettingsComponentFactory(): SpaceSettingsComponentFactory | null {
        return null;
    }
}