import dayjs from "dayjs";
import { Note, Notu, Space, Tag } from "notu";
import { CancelledData } from "../common/CancelledNoteTagData";
import { CommonSpace } from "../common/CommonSpace";
import { DurationData } from "../common/DurationNoteTagData";
import { FinishedData } from "../common/FinishedNoteTagData";
import { RecurringData } from "../common/RecurringNoteTagData";
import { ScheduledData } from "../common/ScheduledNoteTagData";
import { ProcessesSpace } from "../processes/ProcessesSpace";
import { CalendarSpace } from "./CalendarSpace";
import { CalendarSpaceSetup } from "./CalendarSpaceSetup";
import { RecurringEventsProcessData } from "./RecurringEventsProcessNoteTagData";

export class RecurringEventsProcessContext {
    private _notu: Notu;

    private _calendar: CalendarSpace;
    get calendarSpace(): CalendarSpace { return this._calendar; }

    private _common: CommonSpace;
    get commonSpace(): CommonSpace { return this._common; }

    private _processes: ProcessesSpace;
    get processesSpace(): ProcessesSpace { return this._processes; }

    constructor(notu: Notu) {
        this._notu = notu;
        this._calendar = new CalendarSpace(notu);
        this._common = new CommonSpace(notu);
        this._processes = new ProcessesSpace(notu);
    }

    async getRecurringEvents(): Promise<Array<Note>> {
        return await this._notu.getNotes(
            `name IS NOT NULL AND #[${this._calendar.event.getFullName()}] AND #[${this._common.recurring.getFullName()}] AND NOT #[${this._common.ignore.getFullName()}]`
        );
    }

    async getGeneratedEvents(tag: Tag): Promise<Array<Note>> {
        return await this._notu.getNotes(
            `#[${tag.getFullName()}] AND #[${this._common.generated.getFullName()}]`
        );
    }

    private _processData: RecurringEventsProcessData;
    private async _loadProcessData(): Promise<RecurringEventsProcessData> {
        try {
            if (!this._processData) {
                const processNote = (await this._notu.getNotes(
                    `@[${CalendarSpaceSetup.recurringEventsProcess}]`,
                    this._calendar.space.id
                ))[0];
                this._processData = new RecurringEventsProcessData(
                    processNote.getTag(this.processesSpace.process)
                );
            }
            return this._processData;
        }
        catch {
            throw new Error(`Failed to load Generate Celebration Events Process data`);
        }
    }
    async getSpaceToSaveEventsTo(): Promise<Space> {
        const spaceId = (await this._loadProcessData()).saveEventsToSpaceId;
        return this._notu.getSpace(spaceId);
    }
}


export async function generateRecurringNotes(
    context: RecurringEventsProcessContext
): Promise<Array<Note>> {

    const spaceToSaveEventsTo = await context.getSpaceToSaveEventsTo();
    if (!spaceToSaveEventsTo) {
        throw new Error(`Check your Generate Recurring Events Process configuration. It appears to be pointing to non-existent spaces.`)
    }

    const defs = await context.getRecurringEvents();

    const output = [];

    for (const def of defs) {
        const recurringData = RecurringData.new(def.getTag(context.commonSpace.recurring));

        const previousEventDates = (await context.getGeneratedEvents(def.ownTag))
        .map(x => getEventDate(x, context.commonSpace))
        .filter(x => x != null)
        .sort((a, b) => b.getTime() - a.getTime());

        const newEventDates = getNewEventDates(recurringData, previousEventDates);

        for (const newEventDate of newEventDates) {
            const eventNote = generateNewEventNote(
                newEventDate,
                def,
                context.commonSpace
            );
            output.push(eventNote);
        }
    }

    return output;
}


export function generateNewEventNote(
    eventDate: Date,
    recurringEventNote: Note,
    commonSpace: CommonSpace
): Note {
    const event = recurringEventNote.duplicateAsNew();
    event.removeTag(commonSpace.recurring);
    event.removeTag(commonSpace.duration);
    event.addTag(recurringEventNote.ownTag);
    event.addTag(commonSpace.generated);
    const scheduled = ScheduledData.addTag(event, commonSpace);
    scheduled.includeTime = true;
    scheduled.start = eventDate;
    const durationNT = DurationData.new(recurringEventNote.getTag(commonSpace.duration));
    if (!!durationNT)
        scheduled.durationMs = durationNT.ms;

    return event;
}


export function getEventDate(event: Note, commonSpace: CommonSpace): Date | null {
    const scheduledData = ScheduledData.new(event.getTag(commonSpace.scheduled));
    if (!!scheduledData)
        return scheduledData.start;
    const finishedData = FinishedData.new(event.getTag(commonSpace.finished));
    if (!!finishedData)
        return finishedData.date;
    const cancelledData = CancelledData.new(event.getTag(commonSpace.cancelled));
    if (!!cancelledData)
        return cancelledData.date;
    return null;
}


export function getNewEventDates(
    recurringData: RecurringData,
    previousEventDates: Array<Date>
): Array<Date> {

    const output = [];
    let date = dayjs().startOf('day').add(12, 'hours').toDate();
    for (let i = 0; i < recurringData.daysLookahead; i++) {
        if (recurringData.isDueOn(date, previousEventDates)) {
            output.push(date);
            previousEventDates.push(date);
        }
        date = dayjs(date).add(1, 'day').toDate();
    }
    return output;
}