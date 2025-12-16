import { Note, Notu, Page, Space } from "notu";

export class CalendarSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.calendar'; }
    static get event(): string { return 'Event'; }
    static get tentative(): string { return 'Tentative'; }

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
        
            const internalsPage = new Page();
            internalsPage.name = 'Calendar Space Setup';
            internalsPage.order = 10;
            internalsPage.group = 'Calendar';
            internalsPage.space = calendarSpace;
            internalsPage.query = `t.isInternal OR #Common.Process OR #Common.Template`;
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