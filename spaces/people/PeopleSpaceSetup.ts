import { Note, Notu, Page, Space } from "notu";
import { ProcessesSpace } from "../processes/ProcessesSpace";
import { CelebrationEventsProcessData } from "./CelebrationEventsProcessNoteTagData";

export class PeopleSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.people'; }
    static get person(): string { return 'Person'; }
    static get circle(): string { return 'Circle'; }
    static get celebration(): string { return 'Celebration'; }
    static get celebrationEventsProcess(): string { return 'Generate Celebration Events Process'; }

    static async setup(notu: Notu): Promise<void> {
        let peopleSpace = notu.getSpaceByInternalName(this.internalName);
        if (!peopleSpace) {
            peopleSpace = new Space('People').v('1.0.0');
            peopleSpace.internalName = this.internalName;
            await notu.saveSpace(peopleSpace);

            const person = new Note(`Adding this tag to a note marks that the note represents a particular person. This tag requires that the note has its own tag defined, so that the person can be referenced by other notes.`)
                .in(peopleSpace).setOwnTag(this.person);
            person.ownTag.asInternal();

            const circle = new Note(`Adding this tag to a note marks that the note represents a particular social circle which you can add people to. This provides an easy way to help group together the various people in your life. This tag requires that the note has its own tag defined, so that Person notes can reference it.`)
                .in(peopleSpace).setOwnTag(this.circle);
            circle.ownTag.asInternal();

            const celebration = new Note(`
Adding this tag to a note marks the note as representing a particular recurring celebration. This tag requires that the note has its own tag defined, that way person & social circle notes can reference celebrations to indicate that they are included in that celebration.
                
Some celebrations, like Christmas, happen at a fixed time each year and so are best defined by also including the Common.Recurring tag on them. For these, each person or social circle linking to the celebration just indicates their involvement.

Others, like birthdays, happen throughout the year on different days for different people. For these celebrations it is best to have no recurring information on the celebration note itself. Instead, each person or social circle will get to define their own day of the year when that celebration occurs on for them.`)
                .in(peopleSpace).setOwnTag(this.celebration);
            celebration.ownTag.asInternal();

            await notu.saveNotes([
                person,
                circle,
                celebration
            ]);

            const processesSpace = new ProcessesSpace(notu);

            const celebrationEventsProcess = new Note(`
This process will automatically generate calendar events out of celebrations for any people or social circles who have been linked to those celebrations. It will also optionally set up tasks in advance of the events to help you plan for those events. After all, what's the benefit of knowing it's your partner's birthday if you only remember the day of?
                `)
                .in(peopleSpace).setOwnTag(this.celebrationEventsProcess);
            celebrationEventsProcess.ownTag.asInternal();
            celebrationEventsProcess.addTag(processesSpace.pageProcess);
            const processData = CelebrationEventsProcessData.addTag(celebrationEventsProcess, processesSpace);
            processData.saveEventsToSpaceId = peopleSpace.id;
            processData.savePlanTasksToSpaceId = peopleSpace.id;
            await notu.saveNotes([celebrationEventsProcess]);

            const internalsPage = new Page();
            internalsPage.name = 'People Space Setup';
            internalsPage.order = 4;
            internalsPage.group = 'People';
            internalsPage.space = peopleSpace;
            internalsPage.query = `t.isInternal OR #Common.Process`;
            await notu.savePage(internalsPage);

            const celPage = new Page();
            celPage.name = 'Celebrations';
            celPage.order = 4;
            celPage.group = 'People';
            celPage.space = peopleSpace;
            celPage.query = `#People.Celebration`;
            await notu.savePage(celPage);

            const peoplePage = new Page();
            peoplePage.name = 'People';
            peoplePage.order = 5;
            peoplePage.group = 'People';
            peoplePage.space = peopleSpace;
            peoplePage.query = `#People.Person`;
            await notu.savePage(peoplePage);

            const circlePage = new Page();
            circlePage.name = 'Circles';
            circlePage.order = 6;
            circlePage.group = 'People';
            circlePage.space = peopleSpace;
            circlePage.query = `#People.Circle`;
            await notu.savePage(circlePage);
        }
    }
}