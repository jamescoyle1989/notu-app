import { Note, Notu, Space } from "notu";

export class ProcessesSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.processes'; }
    static get process(): string { return 'Process'; }
    static get processAvailability(): string { return 'Process Availability'; }
    static get createNoteProcess(): string { return 'Create Note'; }
    static get editNoteProcess(): string { return 'Update Note'; }
    static get deleteNoteProcess(): string { return 'Delete Note'; }

    static async setup(notu: Notu): Promise<void> {
        let processesSpace = notu.getSpaceByInternalName(this.internalName);
        if (!processesSpace) {
            processesSpace = new Space('Processes').v('1.0.0');
            processesSpace.internalName = this.internalName;
            await notu.saveSpace(processesSpace);

            const process = new Note(`This is the base note for all processes. It's recommended not to add this to your own notes.`)
                .in(processesSpace).setOwnTag(this.process);
            process.ownTag.asInternal();

            const processAvailability = new Note(`When creating a note that defines a process, add this tag if you would like the process to appear as a context menu option when highlighting notes. Once added, you will get a field that allows you to write a query defining which notes get the context menu option.`)
                .in(processesSpace).setOwnTag(this.processAvailability);

            await notu.saveNotes([process, processAvailability]);

            const createNoteProcess = new Note(`Process for creating a new note. This can act as both a Page Process and a Note Process. As a Page Process it will create a new note with the configured tags added to it. As a Note Process it will add a new note related to the note that the process was called from (so long as it has its own tag).`)
                .in(processesSpace).setOwnTag(this.createNoteProcess);
            createNoteProcess.ownTag.asInternal();
            createNoteProcess.addTag(process.ownTag);
            createNoteProcess.addTag(processAvailability.ownTag);

            const editNoteProcess = new Note(`Process for editing an existing note. This will add/remove the configured tags to the note and then either auto-save the note, or display a note editor for you to configure additional changes before manually saving yourself.`)
                .in(processesSpace).setOwnTag(this.editNoteProcess);
            editNoteProcess.ownTag.asInternal();
            editNoteProcess.addTag(process.ownTag);
            editNoteProcess.addTag(processAvailability.ownTag);

            const deleteNoteProcess = new Note(`Process for deleting an existing note. This will optionally require confirmation before performing the deletion.`)
                .in(processesSpace).setOwnTag(this.deleteNoteProcess);
            deleteNoteProcess.ownTag.asInternal();
            deleteNoteProcess.addTag(process.ownTag);
            deleteNoteProcess.addTag(processAvailability.ownTag);

            await notu.saveNotes([
                createNoteProcess,
                editNoteProcess,
                deleteNoteProcess
            ]);
        }
    }
}