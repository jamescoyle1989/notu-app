import { Note, Notu, Space } from "notu";
import { EditNoteProcessData } from "./EditNoteProcessNoteTagData";
import { PageData } from "./PageNoteTagData";
import { ProcessAvailabilityData } from "./ProcessAvailabilityNoteTagData";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export class SystemSpaceSetup {
    
    static async setup(notu: Notu): Promise<void> {
        let systemSpace = notu.getSpaceByInternalName(defs.internalName);
        if (!systemSpace) {
            systemSpace = new Space('System').v('1.0.0');
            systemSpace.internalName = defs.internalName;
            await notu.saveSpace(systemSpace);

            const page = new Note(`Adding this tag to a note marks it as being a page which can be displayed.`)
                .in(systemSpace).setOwnTag(defs.page);
            page.ownTag.asInternal();

            const process = new Note(`Add this tag to a note for the system to recognise it as a process which can be called.`)
                .in(systemSpace).setOwnTag(defs.process);
            process.ownTag.asInternal();

            const processAvailability = new Note(`When creating a note that defines a process, add this tag if you would like the process to appear as a context menu option when highlighting notes. Once added, you will get a field that allows you to write a query defining which notes get the context menu option.`)
                .in(systemSpace).setOwnTag(defs.processAvailability);
            processAvailability.ownTag.asInternal();

            const filter = new Note(`This tag defines any note that links to it as being a filter, which can be used for dynamically customising the filtering used on a page.`)
                .in(systemSpace).setOwnTag(defs.filter);
            filter.ownTag.asInternal();

            await notu.saveNotes([page, process, processAvailability, filter]);

            const createNoteProcess = new Note(`Process for creating a new note. It will create a new note with the configured tags, text & space, then display the new note for further editing and saving.`)
                .in(systemSpace).setOwnTag(defs.createNoteProcess);
            createNoteProcess.ownTag.asInternal();
            createNoteProcess.addTag(process.ownTag);

            const editNoteProcess = new Note(`Process for editing an existing note. This will add/remove the configured tags to the note and then either auto-save the note, or display a note editor for you to configure additional changes before manually saving yourself.`)
                .in(systemSpace).setOwnTag(defs.editNoteProcess);
            editNoteProcess.ownTag.asInternal();
            editNoteProcess.addTag(process.ownTag);

            const deleteNoteProcess = new Note(`Process for deleting an existing note. This will optionally require confirmation before performing the deletion.`)
                .in(systemSpace).setOwnTag(defs.deleteNoteProcess);
            deleteNoteProcess.ownTag.asInternal();
            deleteNoteProcess.addTag(process.ownTag);

            const cloneNoteProcess = new Note(`Process for cloning an existing note. This will add/remove the configured tags to the cloned note and then either auto-save it, or display a note editor for you to configure additional changes before manually saving yourself.`)
                .in(systemSpace).setOwnTag(defs.cloneNoteProcess);
            cloneNoteProcess.ownTag.asInternal();
            cloneNoteProcess.addTag(process.ownTag);

            await notu.saveNotes([
                createNoteProcess,
                editNoteProcess,
                deleteNoteProcess,
                cloneNoteProcess
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

            const processesPage = new Note(`This page will display all processes that are callable from within the system, as well as all availabilities of them.`)
                .in(systemSpace).setOwnTag('Processes Page');
            processesPage.ownTag.asInternal();
            const processesPageData = PageData.addTag(processesPage, systemSpaceObj);
            processesPageData.name = 'Processes';
            processesPageData.group = 'System';
            processesPageData.order = 3;
            processesPageData.query = `#System.Process OR #[System.Process Availability] GROUP BY #System.Process AS 'Definitions', 1 AS 'Availabilities'`;
            processesPageData.searchAllSpaces = true;

            const editPageProcess = new Note(`Options for editing page notes`)
                .in(systemSpace);
            const editPageProcAvailability = ProcessAvailabilityData.addTag(editPageProcess, systemSpaceObj);
            editPageProcAvailability.query = `#System.Page`;
            const editPageProcData = EditNoteProcessData.addTag(editPageProcess, systemSpaceObj);
            editPageProcData.name = 'Edit Page';
            editPageProcData.hasEditorSettings = true;

            await notu.saveNotes([pagesPage, processesPage, editPageProcess]);
        }

        if (systemSpace.version == '1.0.0') {
            systemSpace.version = '1.1.0';
            const system = new SystemSpace(notu);

            const showRelatedNotesProcess = new Note(`Process for showing all notes which reference a particular tagged note.`)
                .in(systemSpace).setOwnTag(defs.showRelatedNotesProcess);
            showRelatedNotesProcess.ownTag.asInternal();
            showRelatedNotesProcess.addTag(system.process);

            await notu.saveNotes([showRelatedNotesProcess]);
            await notu.saveSpace(systemSpace);
        }

        if (systemSpace.version == '1.1.0') {
            systemSpace.version = '1.2.0';
            const system = new SystemSpace(notu);

            const deleteDisplayedNotesProcess = new Note(`Process for deleting all notes (except internal ones) which are currently being displayed by the active page. This process expects to be added to a page so that it's displayed as a button. Once pressed it will run the same query that the page does, and then delete all returned notes.`)
                .in(systemSpace).setOwnTag(defs.deleteDisplayedNotesProcess);
            deleteDisplayedNotesProcess.ownTag.asInternal();
            deleteDisplayedNotesProcess.addTag(system.process);

            const passwordProtection = new Note(`This tag allows users to create their own password protection rule tags. These password protection rules can then be added to other notes to allow for parts of the note text to be encrypted, and to require user authentication before the note can be modified.`)
                .in(systemSpace).setOwnTag(defs.passwordProtection);
            passwordProtection.ownTag.asInternal();

            await notu.saveNotes([deleteDisplayedNotesProcess, passwordProtection]);
            await notu.saveSpace(systemSpace);
        }
    }
}