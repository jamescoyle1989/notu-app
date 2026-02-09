import { Note, Notu, Space } from "notu";
import { PageData } from "./PageNoteTagData";
import { SystemSpace } from "./SystemSpace";

export class SystemSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.system'; }
    static get page(): string { return 'Page'; }
    static get process(): string { return 'Process'; }
    static get processAvailability(): string { return 'Process Availability'; }
    static get createNoteProcess(): string { return 'Create Note'; }
    static get editNoteProcess(): string { return 'Update Note'; }
    static get deleteNoteProcess(): string { return 'Delete Note'; }

    static async setup(notu: Notu): Promise<void> {
        let systemSpace = notu.getSpaceByInternalName(this.internalName);
        if (!systemSpace) {
            systemSpace = new Space('System').v('1.0.0');
            systemSpace.internalName = this.internalName;
            await notu.saveSpace(systemSpace);

            const page = new Note(`Adding this tag to a note marks it as being a page which can be displayed.`)
                .in(systemSpace).setOwnTag(this.page);
            page.ownTag.asInternal();

            const process = new Note(`Add this tag to a note for the system to recognise it as a process which can be called.`)
                .in(systemSpace).setOwnTag(this.process);
            process.ownTag.asInternal();

            const processAvailability = new Note(`When creating a note that defines a process, add this tag if you would like the process to appear as a context menu option when highlighting notes. Once added, you will get a field that allows you to write a query defining which notes get the context menu option.`)
                .in(systemSpace).setOwnTag(this.processAvailability);
            processAvailability.ownTag.asInternal();

            await notu.saveNotes([page, process, processAvailability]);

            const createNoteProcess = new Note(`Process for creating a new note. This can act as both a Page Process and a Note Process. As a Page Process it will create a new note with the configured tags added to it. As a Note Process it will add a new note related to the note that the process was called from (so long as it has its own tag).`)
                .in(systemSpace).setOwnTag(this.createNoteProcess);
            createNoteProcess.ownTag.asInternal();
            createNoteProcess.addTag(process.ownTag);

            const editNoteProcess = new Note(`Process for editing an existing note. This will add/remove the configured tags to the note and then either auto-save the note, or display a note editor for you to configure additional changes before manually saving yourself.`)
                .in(systemSpace).setOwnTag(this.editNoteProcess);
            editNoteProcess.ownTag.asInternal();
            editNoteProcess.addTag(process.ownTag);

            const deleteNoteProcess = new Note(`Process for deleting an existing note. This will optionally require confirmation before performing the deletion.`)
                .in(systemSpace).setOwnTag(this.deleteNoteProcess);
            deleteNoteProcess.ownTag.asInternal();
            deleteNoteProcess.addTag(process.ownTag);

            await notu.saveNotes([
                createNoteProcess,
                editNoteProcess,
                deleteNoteProcess
            ]);

            const editNoteChild = new Note().in(systemSpace);
            editNoteChild.addTag(process.ownTag);
            editNoteChild.addTag(editNoteProcess.ownTag);
            editNoteChild.addTag(processAvailability.ownTag);

            await notu.saveNotes([
                editNoteChild
            ]);

            const systemSpaceObj = new SystemSpace(notu);

            const pagesPage = new Note(`This page will display all pages set up in the system.`)
                .in(systemSpace).setOwnTag('Pages Page');
            pagesPage.ownTag.asInternal();
            const pagePageData = PageData.addTag(pagesPage, systemSpaceObj);
            pagePageData.name = 'Pages';
            pagePageData.group = 'System';
            pagePageData.order = 1;
            pagePageData.query = `#System.Page ORDER BY #System.Page{.order}`;
            pagePageData.searchAllSpaces = true;

            const processesPage = new Note(`This page will display all processes that have been configured within the system.`)
                .in(systemSpace).setOwnTag('Processes Page');
            processesPage.ownTag.asInternal();
            const processesPageData = PageData.addTag(processesPage, systemSpaceObj);
            processesPageData.name = 'Processes';
            processesPageData.group = 'System';
            processesPageData.order = 3;
            processesPageData.query = `#System.Process`;
            processesPageData.searchAllSpaces = true;

            await notu.saveNotes([pagesPage, processesPage]);
        }
    }
}