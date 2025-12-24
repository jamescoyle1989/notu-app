import { Note, Notu, Page, Space } from "notu";
import { CommonSpace } from "../common/CommonSpace";
import { CompressRoutinesProcessData } from "./CompressRoutinesProcessNoteTagData";
import { GenerateRoutinesProcessData } from "./GenerateRoutinesProcessNoteTagData";

export class RoutinesSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.routines'; }
    static get routine(): string { return 'Routine'; }
    static get generateRoutinesProcess(): string { return 'Generate Routines Process'; }
    static get compressRoutinesProcess(): string { return 'Compress Routines Process'; }

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

            const commonSpace = new CommonSpace(notu);

            const generateRoutinesProcess = new Note(`
This process will automatically generate notes from routine definitions according to the schedules that they've been set up with.
                `)
                .in(routinesSpace).setOwnTag(this.generateRoutinesProcess);
            const generateProcessData = GenerateRoutinesProcessData.addTag(generateRoutinesProcess, commonSpace);
            generateProcessData.saveNotesToSpaceId = routinesSpace.id;
            
            const compressRoutinesProcess = new Note(`
This process will automatically compress finished notes that were generated from routine definitions. Otherwise you end up with loads of notes that aren't particularly helpful. This process will boil those notes down into just one note that gives a summary of what routines were done on each day.
                `)
                .in(routinesSpace).setOwnTag(this.compressRoutinesProcess);
            const compressProcessData = CompressRoutinesProcessData.addTag(compressRoutinesProcess, commonSpace);
            compressProcessData.saveNotesToSpaceId = routinesSpace.id;
            
            await notu.saveNotes([
                generateRoutinesProcess,
                compressRoutinesProcess
            ]);
            
            const internalsPage = new Page();
            internalsPage.name = 'Routines Space Setup';
            internalsPage.order = 20;
            internalsPage.group = 'Routines';
            internalsPage.space = routinesSpace;
            internalsPage.query = `t.isInternal OR #Common.Process`;
            await notu.savePage(internalsPage);
            
            const routinesPage = new Page();
            routinesPage.name = 'Routines';
            routinesPage.order = 21;
            routinesPage.group = 'Routines';
            routinesPage.space = routinesSpace;
            routinesPage.query = `#Routine ORDER BY name`;
            await notu.savePage(routinesPage);
            
            const routineTasksPage = new Page();
            routineTasksPage.name = 'Routine Tasks';
            routineTasksPage.order = 22;
            routineTasksPage.group = 'Routines';
            routineTasksPage.space = routinesSpace;
            routineTasksPage.query = `_#Routines.Routine AND #Common.Generated AND #Common.Scheduled ORDER BY #Common.Scheduled{.start}`;
            await notu.savePage(routineTasksPage);
        }
    }
}