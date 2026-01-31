import { dateToText } from "@/helpers/RenderHelpers";
import dayjs from "dayjs";
import { Note, Notu, Space } from "notu";
import { CalendarSpace } from "../calendar/CalendarSpace";
import { CommonSpace } from "../common/CommonSpace";
import { DurationData } from "../common/DurationNoteTagData";
import { RecurringData } from "../common/RecurringNoteTagData";
import { ScheduledData } from "../common/ScheduledNoteTagData";
import { TasksSpace } from "../tasks/TasksSpace";
import { CelebrationEventsProcessData } from "./CelebrationEventsProcessNoteTagData";
import { PeopleSpace } from "./PeopleSpace";
import { PersonCelebrationData } from "./PersonCelebrationNoteTagData";


export class CelebrationEventsProcessContext {
    private _notu: Notu;

    private _people: PeopleSpace;
    get peopleSpace(): PeopleSpace { return this._people; }

    private _common: CommonSpace;
    get commonSpace(): CommonSpace { return this._common; }

    private _tasks: TasksSpace;
    get tasksSpace(): TasksSpace { return this._tasks; }

    private _calendar: CalendarSpace;
    get calendarSpace(): CalendarSpace { return this._calendar; }

    constructor(processData: CelebrationEventsProcessData, notu: Notu) {
        this._notu = notu;
        this._people = new PeopleSpace(notu);
        this._common = new CommonSpace(notu);
        this._tasks = new TasksSpace(notu);
        this._calendar = new CalendarSpace(notu);
        this._processData = processData;
    }

    async getPeopleAndCircles(): Promise<Array<Note>> {
        return await this._notu.getNotes(
            `(#[${this._people.person.getFullName()}] OR #[${this._people.circle.getFullName()}]) AND name IS NOT NULL`
        );
    }

    async getCelebrations(): Promise<Array<Note>> {
        return await this._notu.getNotes(
            `#[${this._people.celebration.getFullName()}] AND name IS NOT NULL`
        );
    }

    async getPreviouslyGeneratedEvents(): Promise<Array<Note>> {
        const calendar = new CalendarSpace(this._notu);

        return await this._notu.getNotes(`
            _#[${this._people.celebration.getFullName()}] AND 
            (_#[${this._people.person.getFullName()}] OR _#[${this._people.circle.getFullName()}]) AND 
            #[${this._common.generated.getFullName()}] AND
            #[${calendar.event.getFullName()}]
        `);
    }

    async getPreviouslyGeneratedReminders(): Promise<Array<Note>> {
        const tasks = new TasksSpace(this._notu);

        return await this._notu.getNotes(`
            _#[${this._people.celebration.getFullName()}] AND 
            (_#[${this._people.person.getFullName()}] OR _#[${this._people.circle.getFullName()}]) AND 
            #[${this._common.generated.getFullName()}] AND 
            (#[${tasks.task.getFullName()}] OR #[${tasks.project.getFullName()}])
        `);
    }

    private _processData: CelebrationEventsProcessData;
    getSpaceToSaveEventsTo(): Space {
        const spaceId = this._processData.saveEventsToSpaceId;
        return this._notu.getSpace(spaceId);
    }
    getSpaceToSaveRemindersTo(): Space {
        const spaceId = this._processData.savePlanTasksToSpaceId;
        return this._notu.getSpace(spaceId);
    }
}


export async function generateCelebrationNotes(
    context: CelebrationEventsProcessContext
): Promise<Array<Note>> {

    const spaceToSaveEventsTo = context.getSpaceToSaveEventsTo();
    const spaceToSaveRemindersTo = context.getSpaceToSaveRemindersTo();
    if (!spaceToSaveEventsTo || !spaceToSaveRemindersTo) {
        throw new Error(`Check your Generate Celebration Events Process configuration. It appears to be pointing to non-existent spaces.`)
    }

    const people = await context.getPeopleAndCircles();
    const celebrations = await context.getCelebrations();
    const previousEvents = await context.getPreviouslyGeneratedEvents();

    const output = [];

    for (const celebration of celebrations) {
        const recurringData = RecurringData.new(celebration.getTag(context.commonSpace.recurring));

        for (const person of people) {
            
            const personCelebrationData = PersonCelebrationData.new(person.getTag(celebration.ownTag));
            if (!personCelebrationData)
                continue;

            const previousEventDates = previousEvents
            .filter(x => 
                !!x.getTag(celebration.ownTag) &&
                !!x.getTag(person.ownTag)
            )
            .map(x => getEventDate(x, context.commonSpace))
            .filter(x => x != null)
            .sort((a, b) => b.getTime() - a.getTime());

            const newEventDates = getNewCelebrationDates(recurringData, personCelebrationData, previousEventDates);
            
            for (const newEventDate of newEventDates) {
                const eventNote = generateNewEventNote(
                    newEventDate,
                    celebration,
                    person,
                    spaceToSaveEventsTo,
                    context.calendarSpace,
                    context.commonSpace
                );
                output.push(eventNote);
                const reminderNote = generateNewReminderNote(
                    newEventDate,
                    personCelebrationData,
                    celebration,
                    person,
                    spaceToSaveRemindersTo,
                    context.tasksSpace,
                    context.commonSpace
                );
                if (!!reminderNote)
                    output.push(reminderNote);
            }
        }
    }

    return output;
}


export function getNewCelebrationDates(
    recurringData: RecurringData,
    personCelebrationData: PersonCelebrationData,
    previousEventDates: Array<Date>
): Array<Date> {

    if (recurringData != null) {
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
    else {
        const dayOfYear = personCelebrationData.date;
        const thisYear = dayjs()
            .month(dayOfYear.getMonth())
            .date(dayOfYear.getDate())
            .startOf('day')
            .add(12, 'hours');
        const nextYear = dayjs()
            .add(1, 'year')
            .month(dayOfYear.getMonth())
            .date(dayOfYear.getDate())
            .startOf('day')
            .add(12, 'hours');
        return [thisYear, nextYear]
        .filter(d => {
            const now = dayjs();
            if (d.isBefore(now))
                return false;
            if (Math.abs(now.diff(d, 'days')) > 365)
                return false;
            if (!!previousEventDates.find(x => 
                x.getFullYear() == d.year() &&
                x.getMonth() == d.month() &&
                x.getDate() == d.date()
            )) {
                return false;
            }
            return true;
        })
        .map(d => d.toDate());
    }
}


export function getEventDate(event: Note, commonSpace: CommonSpace): Date {
    const scheduledData = ScheduledData.new(event.getTag(commonSpace.scheduled));
    return scheduledData?.start
}


export function generateNewEventNote(
    eventDate: Date,
    celebration: Note,
    person: Note,
    eventsSpace: Space,
    calendarSpace: CalendarSpace,
    commonSpace: CommonSpace
): Note {
    const event = new Note(`${celebration.ownTag.name} for ${person.ownTag.name}`)
        .in(eventsSpace);
    event.addTag(celebration.ownTag);
    event.addTag(person.ownTag);
    event.addTag(calendarSpace.event);
    event.addTag(commonSpace.generated);
    const scheduled = ScheduledData.addTag(event, commonSpace);
    scheduled.includeTime = true;
    scheduled.start = eventDate;
    const celebrationDuration = DurationData.new(celebration.getTag(commonSpace.duration));
    if (!!celebrationDuration)
        scheduled.durationMs = celebrationDuration.ms;

    return event;
}


export function generateNewReminderNote(
    eventDate: Date,
    personCelebrationData: PersonCelebrationData,
    celebration: Note,
    person: Note,
    remindersSpace: Space,
    tasksSpace: TasksSpace,
    commonSpace: CommonSpace
): Note {
    if (personCelebrationData.planDaysAhead == null)
        return null;

    const reminder = new Note(`Begin thinking of ${celebration.ownTag.name} plans for ${person.ownTag.name} (${dateToText(eventDate)})`)
        .in(remindersSpace);
    reminder.addTag(celebration.ownTag);
    reminder.addTag(person.ownTag);
    reminder.addTag(tasksSpace.task);
    reminder.addTag(commonSpace.generated);
    const scheduled = ScheduledData.addTag(reminder, commonSpace);
    scheduled.includeTime = true;
    scheduled.start = dayjs(eventDate).subtract(personCelebrationData.planDaysAhead, 'days').toDate();

    return reminder;
}