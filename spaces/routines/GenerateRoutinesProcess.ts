import dayjs from "dayjs";
import { Note, NoteTag, Notu, Space, Tag } from "notu";
import { CancelledData } from "../common/CancelledNoteTagData";
import { CommonSpace } from "../common/CommonSpace";
import { DurationData } from "../common/DurationNoteTagData";
import { FinishedData } from "../common/FinishedNoteTagData";
import { RecurringData } from "../common/RecurringNoteTagData";
import { ScheduledData } from "../common/ScheduledNoteTagData";
import { GenerateRoutinesProcessData } from "./GenerateRoutinesProcessNoteTagData";
import { LinkedRoutineData, RoutineRelationType } from "./LinkedRoutineNoteTagData";
import { RoutinesSpace } from "./RoutinesSpace";
import { RoutinesSpaceSetup } from "./RoutinesSpaceSetup";

export class GenerateRoutinesProcessContext {
    private _notu: Notu;

    private _routines: RoutinesSpace;
    get routinesSpace(): RoutinesSpace { return this._routines; }

    private _common: CommonSpace;
    get commonSpace(): CommonSpace { return this._common; }

    constructor(notu: Notu) {
        this._notu = notu;
        this._common = new CommonSpace(notu);
        this._routines = new RoutinesSpace(notu);
    }

    async getActiveRoutines(): Promise<Array<Note>> {
        return await this._notu.getNotes(
            `#[${this._routines.routine.getFullName()}] AND NOT #[${this._common.ignore.getFullName()}]`
        );
    }

    async getPendingRoutineTasks(): Promise<Array<Note>> {
        return await this._notu.getNotes(`
            _#[${this._routines.routine.getFullName()}]
            AND #[${this._common.scheduled.getFullName()}]
            AND #[${this._common.generated.getFullName()}]
            AND NOT (
                #[${this._common.finished.getFullName()}]
                OR #[${this._common.cancelled.getFullName()}]
            )`
        );
    }

    async getHistoricRoutineTasks(): Promise<Array<Note>> {
        return await this._notu.getNotes(`
            _#[${this._routines.routine.getFullName()}]
            AND #[${this._common.generated.getFullName()}]
            AND (
                #[${this._common.finished.getFullName()}]
                OR #[${this._common.cancelled.getFullName()}]
            )
        `);
    }

    private _processData: GenerateRoutinesProcessData;
    private async _loadProcessData(): Promise<GenerateRoutinesProcessData> {
        try {
            if (!this._processData) {
                const processNote = (await this._notu.getNotes(
                    `@[${RoutinesSpaceSetup.generateRoutinesProcess}]`,
                    this._routines.space.id
                ))[0];
                this._processData = new GenerateRoutinesProcessData(
                    processNote.getTag(this.commonSpace.process)
                );
            }
            return this._processData;
        }
        catch {
            throw new Error(`Failed to load Generate Routines Process data`);
        }
    }
    async getSpaceToSaveNotesTo(): Promise<Space> {
        const spaceId = (await this._loadProcessData()).saveNotesToSpaceId;
        return this._notu.getSpace(spaceId);
    }
}


export async function generateRoutines(
    context: GenerateRoutinesProcessContext
): Promise<Array<Note>> {

    const spaceToSaveNotesTo = await context.getSpaceToSaveNotesTo();
    if (!spaceToSaveNotesTo) {
        throw new Error(`Check your Generate Routines Process configuration. It appears to be pointing to non-existent spaces.`);
    }

    const routines = getGenerationOrder(
        await context.getActiveRoutines(),
        context.routinesSpace
    );
    const pendingTasks = await context.getPendingRoutineTasks();
    const historicTasks = await context.getHistoricRoutineTasks();

    const output = [];

    output.push(...bringPendingRoutineTasksUpToDate(pendingTasks, context.commonSpace));

    for (const routine of routines) {
        const newDate = getNewRoutineDate(routine, context.commonSpace, context.routinesSpace, pendingTasks, historicTasks);
        if (newDate == null)
            continue;
        const newTask = generateNewRoutineTaskNote(newDate, routine, context.routinesSpace, context.commonSpace);
        output.push(newTask);
        pendingTasks.push(newTask);
    }

    return output;
}


/** Take already scheduled routines from previous days and update their due date to be today */
export function bringPendingRoutineTasksUpToDate(
    pendingTasks: Array<Note>,
    commonSpace: CommonSpace
): Array<Note> {
    const startOfToday = dayjs().startOf('day').toDate();
    const notesToSave = new Array<Note>();
    for (const pendingTask of pendingTasks) {
        const scheduledData = new ScheduledData(pendingTask.getTag(commonSpace.scheduled));
        if (scheduledData.start < startOfToday) {
            while (scheduledData.start < startOfToday) {
                scheduledData.start = dayjs(scheduledData.start).add(1, 'day').toDate();
            }
            notesToSave.push(pendingTask);
        }
    }
    return notesToSave;
}


export function getGenerationOrder(routines: Array<Note>, routinesSpace: RoutinesSpace): Array<Note> {
    let input = [...routines];
    const output = [];
    while (input.length > 0) {
        const lengthAtStartOfLoop = input.length;
        for (let i = input.length - 1; i >= 0; i--) {
            const routine = input[i];
            const dependencies = getRoutineTagsOnNote(routine, routinesSpace);
            const unresolvedDependencies = dependencies.filter(x => 
                !!input.find(y => x.tag.id == y.ownTag.id)
            );
            if (unresolvedDependencies.length == 0) {
                output.push(routine);
                input.splice(i, 1);
            }
        }
        if (input.length == lengthAtStartOfLoop)
            throw Error(`Circular dependencies detected among the following routines: ${input.map(x => x.ownTag.name).join(', ')}`)
    }
    return output;
}


export function getRoutineTagsOnNote(routine: Note, routinesSpace: RoutinesSpace): Array<NoteTag> {
    return routine.tags.filter(x => x.tag.linksTo(routinesSpace.routine));
}


export function getScheduledDate(pendingTask: Note, commonSpace: CommonSpace): Date {
    const scheduled = new ScheduledData(pendingTask.getTag(commonSpace.scheduled));
    return scheduled.start;
}


export function getNewRoutineDate(
    routine: Note,
    commonSpace: CommonSpace,
    routinesSpace: RoutinesSpace,
    pendingTasks: Array<Note>,
    historicTasks: Array<Note>
): Date | null {

    // Set up storage of data for use later in function
    const dependenciesByRelationType = new Map<RoutineRelationType, Array<Tag>>();
    dependenciesByRelationType.set('Forces Routine Due', []);
    dependenciesByRelationType.set('Must Be Due On Same Day', []);
    dependenciesByRelationType.set('Must Not Be Due On Same Day', []);

    const tagsToFetchHistoryFor = [routine.ownTag];
    for (const nt of getRoutineTagsOnNote(routine, routinesSpace)) {
        const linkedData = new LinkedRoutineData(nt);
        if (linkedData.relationship == 'Is Treated As Equivalent')
            tagsToFetchHistoryFor.push(nt.tag);
        else
            dependenciesByRelationType.get(linkedData.relationship).push(nt.tag);
    }

    // Check if we already have any pending tasks for the routine being generated (or any other routines which we're treating as equivalent)
    for (const tag of tagsToFetchHistoryFor) {
        if (!!pendingTasks.find(x => !!x.getTag(tag)))
            return null;
    }

    // Get the dates of all historic notes containing our routine tag (or other tags treated as equivalent)
    const dateHistory = historicTasks.filter(note => {
        for (const tag of tagsToFetchHistoryFor) {
            if (!!note.getTag(tag))
                return true;
        }
        return false;
    }).map(note => {
        const finished = new FinishedData(note.getTag(commonSpace.finished));
        if (!!finished)
            return finished.date;
        const cancelled = new CancelledData(note.getTag(commonSpace.cancelled));
        if (!!cancelled)
            return cancelled.date;
        throw Error('Uhhh, something went wrong!');
    })

    // Use our recurring data object to start finding suitable days
    const recurringData = RecurringData.new(routine.getTag(commonSpace.recurring));

    let date = dayjs().startOf('day').add(12, 'hours').toDate();
    for (let i = 0; i < recurringData.daysLookahead; i++) {
        if (evaluatePotentialRoutineDueDate(date, recurringData, dateHistory, pendingTasks, dependenciesByRelationType, commonSpace)) {
            return dayjs(date).startOf('day')
                .add(recurringData.timeOfDay.getHours(), 'hours')
                .add(recurringData.timeOfDay.getMinutes(), 'minutes')
                .toDate();
        }
        date = dayjs(date).add(1, 'day').toDate();
    }
    return null;
}


export function evaluatePotentialRoutineDueDate(
    date: Date,
    recurringData: RecurringData,
    dateHistory: Array<Date>,
    pendingTasks: Array<Note>,
    dependenciesByRelationType: Map<RoutineRelationType, Array<Tag>>,
    commonSpace: CommonSpace
): boolean {
    const startOfDate = dayjs(date).startOf('day').toDate();

    const forceDueDeps = dependenciesByRelationType.get('Forces Routine Due');
    if (forceDueDeps.length > 0) {
        for (const pendingTask of pendingTasks) {
            if (dayjs(getScheduledDate(pendingTask, commonSpace)).startOf('day').toDate().getTime() != startOfDate.getTime())
                continue;
            if (!!forceDueDeps.find(x => !!pendingTask.getTag(x)))
                return true;
        }
    }

    if (!recurringData.isDueOn(date, dateHistory))
        return false;

    const dueOnSameDayDeps = dependenciesByRelationType.get('Must Be Due On Same Day');
    if (dueOnSameDayDeps.length > 0) {
        let anyMatches = false;
        for (const pendingTask of pendingTasks) {
            if (dayjs(getScheduledDate(pendingTask, commonSpace)).startOf('day').toDate().getTime() != startOfDate.getTime())
                continue;
            if (!!dueOnSameDayDeps.find(x => !!pendingTask.getTag(x)))
                anyMatches = true;
        }
        if (!anyMatches)
            return false;
    }

    const notDueOnSameDayDeps = dependenciesByRelationType.get('Must Not Be Due On Same Day');
    if (notDueOnSameDayDeps.length > 0) {
        for (const pendingTask of pendingTasks) {
            if (dayjs(getScheduledDate(pendingTask, commonSpace)).startOf('day').toDate().getTime() != startOfDate.getTime())
                continue;
            if (!!notDueOnSameDayDeps.find(x => !!pendingTask.getTag(x)))
                return false;
        }
    }

    return true;
}


export function generateNewRoutineTaskNote(
    date: Date,
    routine: Note,
    routinesSpace: RoutinesSpace,
    commonSpace: CommonSpace
): Note {
    const output = routine.duplicateAsNew().at(new Date());
    output.removeOwnTag();
    output.removeTag(routinesSpace.routine);
    for (const nt of getRoutineTagsOnNote(routine, routinesSpace))
        output.removeTag(nt.tag);
    output.addTag(routine.ownTag);
    output.addTag(commonSpace.generated);
    const scheduled = ScheduledData.addTag(output, commonSpace);
    scheduled.includeTime = true;
    scheduled.start = date;
    const duration = new DurationData(routine.getTag(commonSpace.duration));
    if (!!duration)
        scheduled.durationMs = duration.ms;
    return output;
}