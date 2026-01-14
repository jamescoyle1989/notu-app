import { NoteAction, NoteActionsMenuBuilder, RefreshAction } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { CommonSpaceSetup } from "../common/CommonSpaceSetup";
import { LogicalSpace } from "../LogicalSpace";
import { CalendarSpaceSetup } from "./CalendarSpaceSetup";
import { generateRecurringNotes, RecurringEventsProcessContext } from "./RecurringEventsProcess";
import RecurringEventsProcessNoteTagDataComponentFactory from "./RecurringEventsProcessNoteTagDataComponent";

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
        if (note.ownTag?.name == CalendarSpaceSetup.recurringEventsProcess) {
            menuBuilder.addToTopOfEnd(
                new NoteAction('Run',
                    async () => {
                        try {
                            const newNotes = await generateRecurringNotes(
                                new RecurringEventsProcessContext(notu)
                            );
                            await notu.saveNotes(newNotes);
                            return new RefreshAction();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                )
            )
        }
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        if (
            tag.space.internalName == CommonSpaceSetup.internalName &&
            tag.name == CommonSpaceSetup.process &&
            note.ownTag?.isInternal &&
            note.ownTag?.name == CalendarSpaceSetup.recurringEventsProcess
        )
            return new RecurringEventsProcessNoteTagDataComponentFactory();
        
        return null;
    }
}