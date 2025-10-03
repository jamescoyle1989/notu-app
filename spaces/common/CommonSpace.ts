import { NoteAction, NoteActionsMenuBuilder, RefreshAction, ShowEditorAction } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory, SpaceSettingsComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class CommonSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _address: Tag;
    get address(): Tag { return this._address; }

    private _cancelled: Tag;
    get cancelled(): Tag { return this._cancelled; }

    private _category: Tag;
    get category(): Tag { return this._category; }

    private _duration: Tag;
    get duration(): Tag { return this._duration; }

    private _finished: Tag;
    get finished(): Tag { return this._finished; }

    private _generated: Tag;
    get generated(): Tag { return this._generated; }

    private _ignore: Tag;
    get ignore(): Tag { return this._ignore; }

    private _info: Tag;
    get info(): Tag { return this._info; }

    private _journal: Tag;
    get journal(): Tag { return this._journal; }

    private _memory: Tag;
    get memory(): Tag { return this._memory; }

    private _pinned: Tag;
    get pinned(): Tag { return this._pinned; }

    private _scheduled: Tag;
    get scheduled(): Tag { return this._scheduled; }

    private _thought: Tag;
    get thought(): Tag { return this._thought; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(CommonSpaceSetup.internalName);
        this._address = notu.getTagByName(CommonSpaceSetup.address, this._space);
        this._cancelled = notu.getTagByName(CommonSpaceSetup.cancelled, this._space);
        this._category = notu.getTagByName(CommonSpaceSetup.category, this._space);
        this._duration = notu.getTagByName(CommonSpaceSetup.duration, this._space);
        this._finished = notu.getTagByName(CommonSpaceSetup.finished, this._space);
        this._generated = notu.getTagByName(CommonSpaceSetup.generated, this._space);
        this._ignore = notu.getTagByName(CommonSpaceSetup.ignore, this._space);
        this._info = notu.getTagByName(CommonSpaceSetup.info, this._space);
        this._journal = notu.getTagByName(CommonSpaceSetup.journal, this._space);
        this._memory = notu.getTagByName(CommonSpaceSetup.memory, this._space);
        this._pinned = notu.getTagByName(CommonSpaceSetup.pinned, this._space);
        this._scheduled = notu.getTagByName(CommonSpaceSetup.scheduled, this._space);
        this._thought = notu.getTagByName(CommonSpaceSetup.thought, this._space);
    }


    async setup(notu: Notu): Promise<void> {
        await CommonSpaceSetup.setup(notu);
        this._load(notu);
    }


    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
        if (note.ownTag?.isInternal != true) {
            menuBuilder.addToTopOfStart(
                new NoteAction('Edit',
                    () => Promise.resolve(new ShowEditorAction(note))
                )
            );
            menuBuilder.addToBottomOfEnd(
                new NoteAction('Delete',
                    async () => {
                        await notu.saveNotes([note.delete()]);
                        return new RefreshAction();
                    },
                    true
                )
            );
        }
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        return null;
    }


    getSpaceSettingsComponentFactory(): SpaceSettingsComponentFactory | null {
        return null;
    }
}