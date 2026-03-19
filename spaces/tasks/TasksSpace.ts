import { Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
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
}