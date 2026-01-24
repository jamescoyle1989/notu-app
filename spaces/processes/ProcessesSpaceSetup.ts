import { Note, Notu, Space } from "notu";

export class ProcessesSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.processes'; }
    static get process(): string { return 'Process'; }
    static get noteProcess(): string { return 'Note Process'; }
    static get pageProcess(): string { return 'Page Process'; }
    static get createNoteProcess(): string { return 'Create Note Process'; }
    static get editNoteProcess(): string { return 'Update Note Process'; }
    static get deleteNoteProcess(): string { return 'Delete Note Process'; }

    static async setup(notu: Notu): Promise<void> {
        let processesSpace = notu.getSpaceByInternalName(this.internalName);
        if (!processesSpace) {
            processesSpace = new Space('Processes').v('1.0.0');
            processesSpace.internalName = this.internalName;
            await notu.saveSpace(processesSpace);

            const process = new Note(`This is the base note for all processes. It's recommended not to add this to your own notes.`)
                .in(processesSpace).setOwnTag(this.process);
            process.ownTag.asInternal();

            const noteProcess = new Note(`This is the base note for all processes which can be configured to be callable from a note's context menu. Each note process will take a query that determines which notes the process can be run on.`)
                .in(processesSpace).setOwnTag(this.noteProcess);
            noteProcess.ownTag.asInternal();

            const pageProcess = new Note(`This is the base note for all processes which can be configured to be added to pages. Once added to a page, that page will show a button for running the process.`)
                .in(processesSpace).setOwnTag(this.pageProcess);
            pageProcess.ownTag.asInternal();

            const createNoteProcess = new Note(`Process for creating a new note. This can act as both a Page Process and a Note Process. As a Page Process it will create a new note with the configured tags added to it. As a Note Process it will add a new note related to the note that the process was called from (so long as it has its own tag).`)
                .in(processesSpace).setOwnTag(this.createNoteProcess);
            createNoteProcess.ownTag.asInternal();

            const editNoteProcess = new Note(`Process for editing an existing note. This will add/remove the configured tags to the note and then either auto-save the note, or display a note editor for you to configure additional changes before manually saving yourself.`)
                .in(processesSpace).setOwnTag(this.editNoteProcess);
            editNoteProcess.ownTag.asInternal();

            const deleteNoteProcess = new Note(`Process for deleting an existing note. This will optionally require confirmation before performing the deletion.`)
                .in(processesSpace).setOwnTag(this.deleteNoteProcess);
            deleteNoteProcess.ownTag.asInternal();

            await notu.saveNotes([
                process,
                noteProcess,
                pageProcess,
                createNoteProcess,
                editNoteProcess,
                deleteNoteProcess
            ]);
        }
    }
}