import { Note, Notu, Space } from "notu";
import { SystemSpace } from "../system/SystemSpace";

export class RoutinesSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.routines'; }
    static get routine(): string { return 'Routine'; }
    static get generateRoutinesProcess(): string { return 'Generate Routines'; }
    static get compressRoutinesProcess(): string { return 'Compress Historic Routines'; }

    static async setup(notu: Notu): Promise<void> {
        let routinesSpace = notu.getSpaceByInternalName(this.internalName);
        if (!routinesSpace) {
            routinesSpace = new Space('Routines').v('1.0.0');
            routinesSpace.internalName = this.internalName;
            await notu.saveSpace(routinesSpace);

            const routine = new Note(`This tag defines a note as being a routine to be maintained on a regular interval. This is the definition note from which recurring notes will be generated.`)
                .in(routinesSpace).setOwnTag(this.routine);
            routine.ownTag.asInternal();

            await notu.saveNotes([routine]);

            const systemSpace = new SystemSpace(notu);

            const generateRoutinesProcess = new Note(`
This process will automatically generate notes from routine definitions according to the schedules that they've been set up with.
                `)
                .in(routinesSpace).setOwnTag(this.generateRoutinesProcess);
            generateRoutinesProcess.ownTag.asInternal();
            generateRoutinesProcess.addTag(systemSpace.process);
            
            const compressRoutinesProcess = new Note(`
This process will automatically compress finished notes that were generated from routine definitions. Otherwise you end up with loads of notes that aren't particularly helpful. This process will boil those notes down into just one note that gives a summary of what routines were done on each day.
                `)
                .in(routinesSpace).setOwnTag(this.compressRoutinesProcess);
            compressRoutinesProcess.ownTag.asInternal();
            compressRoutinesProcess.addTag(systemSpace.process);
            
            await notu.saveNotes([
                generateRoutinesProcess,
                compressRoutinesProcess
            ]);
        }
    }
}