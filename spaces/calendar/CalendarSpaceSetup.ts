import { Note, Notu, Page, Space } from "notu";
import { CommonSpace } from "../common/CommonSpace";
import { RecurringEventsProcessData } from "./RecurringEventsProcessNoteTagData";

export class CalendarSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.calendar'; }
    static get event(): string { return 'Event'; }
    static get tentative(): string { return 'Tentative'; }
    static get recurringEventsProcess(): string { return 'Generate Recurring Events Process'; }

    static async setup(notu: Notu): Promise<void> {
        let calendarSpace = notu.getSpaceByInternalName(this.internalName);
        if (!calendarSpace) {
            calendarSpace = new Space('Calendar').v('1.0.0');
            calendarSpace.internalName = this.internalName;
            await notu.saveSpace(calendarSpace);

            const event = new Note(`Add this tag to any note to mark it as an event which can be tracked in the calendar.`)
                .in(calendarSpace).setOwnTag(this.event);
            event.ownTag.asInternal();

            const tentative = new Note(`Add this tag to any note to flag it as being unclear whether it will happen.`)
                .in(calendarSpace).setOwnTag(this.tentative);
            tentative.ownTag.asInternal();

            await notu.saveNotes([
                event,
                tentative
            ]);

            const commonSpace = new CommonSpace(notu);

            const recurringEventsProcess = new Note(`
This process will automatically generate calendar events out of celebrations for any people or social circles who have been linked to those celebrations. It will also optionally set up tasks in advance of the events to help you plan for those events. After all, what's the benefit of knowing it's your partner's birthday if you only remember the day of?

This process will find any definitions for recurring events (notes that define their own tag, that have the #Calendar.Recurring tag, the #Common.Recurring tag, and which aren't marked as ignore). For each one, it will generate new scheduled calendar events according to the rules on the Recurring tag.
                `)
                .in(calendarSpace).setOwnTag(this.recurringEventsProcess);
            recurringEventsProcess.ownTag.asInternal();
            const processData = RecurringEventsProcessData.addTag(recurringEventsProcess, commonSpace);
            processData.saveEventsToSpaceId = calendarSpace.id;
            await notu.saveNotes([recurringEventsProcess]);
        
            const internalsPage = new Page();
            internalsPage.name = 'Calendar Space Setup';
            internalsPage.order = 10;
            internalsPage.group = 'Calendar';
            internalsPage.space = calendarSpace;
            internalsPage.query = `t.isInternal OR #Common.Process`;
            await notu.savePage(internalsPage);
            
            const eventsPage = new Page();
            eventsPage.name = 'Events';
            eventsPage.order = 11;
            eventsPage.group = 'Calendar';
            eventsPage.space = calendarSpace;
            eventsPage.query = `#Calendar.Event`;
            await notu.savePage(eventsPage);
        }
    }
}