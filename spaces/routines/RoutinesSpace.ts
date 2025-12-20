import { NoteAction, NoteActionsMenuBuilder, RefreshAction } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory, SpaceSettingsComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { CommonSpaceSetup } from "../common/CommonSpaceSetup";
import { LogicalSpace } from "../LogicalSpace";
import { CompressRoutinesProcessContext, compressRoutineTasks } from "./CompressRoutinesProcess";
import { generateRoutines, GenerateRoutinesProcessContext } from "./GenerateRoutinesProcess";
import GenerateRoutinesProcessNoteTagDataComponentFactory from "./GenerateRoutinesProcessNoteTagDataComponent";
import LinkedRoutineNoteTagDataComponentFactory from "./LinkedRoutineNoteTagDataComponent";
import RoutineNoteTagDataComponentFactory from "./RoutineNoteTagDataComponent";
import { RoutinesSpaceSetup } from "./RoutinesSpaceSetup";

export class RoutinesSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _routine: Tag;
    get routine(): Tag { return this._routine; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(RoutinesSpaceSetup.internalName);
        this._routine = notu.getTagByName(RoutinesSpaceSetup.routine, this._space);
    }


    async setup(notu: Notu): Promise<void> {
        await RoutinesSpaceSetup.setup(notu);
        this._load(notu);
    }

    
    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
        if (note.ownTag?.name == RoutinesSpaceSetup.generateRoutinesProcess) {
            menuBuilder.addToTopOfEnd(
                new NoteAction('Run',
                    async () => {
                        try {
                            const newNotes = await generateRoutines(
                                new GenerateRoutinesProcessContext(notu)
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
        else if (note.ownTag?.name == RoutinesSpaceSetup.compressRoutinesProcess) {
            menuBuilder.addToTopOfEnd(
                new NoteAction('Run',
                    async () => {
                        try {
                            const newNotes = await compressRoutineTasks(
                                new CompressRoutinesProcessContext(notu)
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
        }

        if (
            tag.linksTo(this.routine) &&
            !!note.getTag(this.routine)
        )
            return new LinkedRoutineNoteTagDataComponentFactory();

        if (
            tag.space.internalName == CommonSpaceSetup.internalName &&
            tag.name == CommonSpaceSetup.process &&
            note.ownTag?.isInternal &&
            note.ownTag?.name == RoutinesSpaceSetup.generateRoutinesProcess
        )
            return new GenerateRoutinesProcessNoteTagDataComponentFactory();

        return null;
    }


    getSpaceSettingsComponentFactory(): SpaceSettingsComponentFactory | null {
        return null;
    }
}