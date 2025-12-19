import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory, SpaceSettingsComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
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
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        return null;
    }


    getSpaceSettingsComponentFactory(): SpaceSettingsComponentFactory | null {
        return null;
    }
}