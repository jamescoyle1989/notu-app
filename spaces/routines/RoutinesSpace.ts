import { NoteAction, NoteActionsMenuBuilder, RefreshAction } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { ProcessesSpace } from "../processes/ProcessesSpace";
import { CompressRoutinesProcessContext, compressRoutineTasks } from "./CompressRoutinesProcess";
import { CompressRoutinesProcessData } from "./CompressRoutinesProcessNoteTagData";
import CompressRoutinesProcessNoteTagDataComponentFactory from "./CompressRoutinesProcessNoteTagDataComponent";
import { generateRoutines, GenerateRoutinesProcessContext } from "./GenerateRoutinesProcess";
import { GenerateRoutinesProcessData } from "./GenerateRoutinesProcessNoteTagData";
import GenerateRoutinesProcessNoteTagDataComponentFactory from "./GenerateRoutinesProcessNoteTagDataComponent";
import LinkedRoutineNoteTagDataComponentFactory from "./LinkedRoutineNoteTagDataComponent";
import RoutineNoteTagDataComponentFactory from "./RoutineNoteTagDataComponent";
import { RoutinesSpaceSetup } from "./RoutinesSpaceSetup";

export class RoutinesSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _routine: Tag;
    get routine(): Tag { return this._routine; }

    private _generateRoutinesProcess: Tag;
    get generateRooutinesProcess(): Tag { return this._generateRoutinesProcess; }

    private _compressRoutinesProcess: Tag;
    get compressRoutinesProcess(): Tag { return this._compressRoutinesProcess; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(RoutinesSpaceSetup.internalName);
        this._routine = notu.getTagByName(RoutinesSpaceSetup.routine, this._space);
        this._generateRoutinesProcess = notu.getTagByName(RoutinesSpaceSetup.generateRoutinesProcess, this._space);
        this._compressRoutinesProcess = notu.getTagByName(RoutinesSpaceSetup.compressRoutinesProcess, this._space);
    }


    async setup(notu: Notu): Promise<void> {
        await RoutinesSpaceSetup.setup(notu);
        this._load(notu);
    }

    
    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
        const processesSpace = new ProcessesSpace(notu);
        if (!!note.getTag(processesSpace.process) && !!note.getTag(this.generateRooutinesProcess)) {
            menuBuilder.addToTopOfEnd(
                new NoteAction('Run',
                    async () => {
                        try {
                            const newNotes = await generateRoutines(
                                new GenerateRoutinesProcessContext(
                                    note.getTagData(this.generateRooutinesProcess, GenerateRoutinesProcessData),
                                    notu
                                )
                            );
                            await notu.saveNotes(newNotes);
                            return new RefreshAction();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                )
            );
        }
        else if (!!note.getTag(processesSpace.process) && !!note.getTag(this.compressRoutinesProcess)) {
            menuBuilder.addToTopOfEnd(
                new NoteAction('Run',
                    async () => {
                        try {
                            const newNotes = await compressRoutineTasks(
                                new CompressRoutinesProcessContext(
                                    note.getTagData(this.compressRoutinesProcess, CompressRoutinesProcessData),
                                    notu
                                )
                            );
                            await notu.saveNotes(newNotes);
                            return new RefreshAction();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                )
            );
        }
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        if (tag.space.internalName == RoutinesSpaceSetup.internalName) {
            if (tag.name == RoutinesSpaceSetup.routine)
                return new RoutineNoteTagDataComponentFactory();

            if (tag.name == RoutinesSpaceSetup.generateRoutinesProcess)
                return new GenerateRoutinesProcessNoteTagDataComponentFactory();

            if (tag.name == RoutinesSpaceSetup.compressRoutinesProcess)
                return new CompressRoutinesProcessNoteTagDataComponentFactory();
        }

        if (
            tag.linksTo(this.routine) &&
            !!note.getTag(this.routine)
        )
            return new LinkedRoutineNoteTagDataComponentFactory();

        return null;
    }
}