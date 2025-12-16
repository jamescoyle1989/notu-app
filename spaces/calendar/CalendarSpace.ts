import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory, SpaceSettingsComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { CalendarSpaceSetup } from "./CalendarSpaceSetup";

export class CalendarSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _event: Tag;
    get event(): Tag { return this._event; }

    private _tentative: Tag;
    get tentative(): Tag { return this._tentative; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(CalendarSpaceSetup.internalName);
        this._event = notu.getTagByName(CalendarSpaceSetup.event, this._space);
        this._tentative = notu.getTagByName(CalendarSpaceSetup.tentative, this._space);
    }


    async setup(notu: Notu): Promise<void> {
        await CalendarSpaceSetup.setup(notu);
        this._load(notu);
    }


    buildNoteActionsMenu(
        note: Note,
        menuBuilder: NoteActionsMenuBuilder,
        notu: Notu
    ) {
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        return null;
    }


    getSpaceSettingsComponentFactory(): SpaceSettingsComponentFactory | null {
        return null;
    }
}