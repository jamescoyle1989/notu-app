import { Note, Notu, Space } from "notu";

export class TasksSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.tasks'; }
    static get task(): string { return 'Task'; }
    static get project(): string { return 'Project'; }
    static get goal(): string { return 'Goal'; }
    static get deadline(): string { return 'Deadline'; }

    static async setup(notu: Notu): Promise<void> {
        let tasksSpace = notu.getSpaceByInternalName(this.internalName);
        if (!tasksSpace) {
            tasksSpace = new Space('Tasks').v('1.0.0');
            tasksSpace.internalName = this.internalName;
            await notu.saveSpace(tasksSpace);

            const task = new Note(`Add this tag to a note to mark it as a task that can be completed in a single work session.`)
                .in(tasksSpace).setOwnTag(this.task);
            task.ownTag.asInternal();

            const project = new Note(`Add this tag to a note to mark it as a project, a larger work item which should be broken down into multiple work parts.`)
                .in(tasksSpace).setOwnTag(this.project);
            project.ownTag.asInternal();

            const goal = new Note(`Add this tag to a note to mark it as a goal, a larger, more nebulous target, which might consist of multiple projects strung together, some of which you may not even know are needed yet.`)
                .in(tasksSpace).setOwnTag(this.goal);
            goal.ownTag.asInternal();

            const deadline = new Note(`Add this tag to a note to mark it as having a deadline which it must be done by.`)
                .in(tasksSpace).setOwnTag(this.deadline);
            deadline.ownTag.asInternal();

            await notu.saveNotes([
                task,
                project,
                goal,
                deadline
            ]);
        }
    }
}