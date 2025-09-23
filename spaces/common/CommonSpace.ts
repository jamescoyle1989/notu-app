import { NoteAction, NoteActionsMenuBuilder, RefreshAction, ShowEditorAction } from "@/helpers/NoteAction";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class CommonSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _thought: Tag;
    get thought(): Tag { return this._thought; }

    private _info: Tag;
    get info(): Tag { return this._info; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(CommonSpaceSetup.internalName);
        this._thought = notu.getTagByName(CommonSpaceSetup.thought, this._space);
        this._info = notu.getTagByName(CommonSpaceSetup.info, this._space);
    }

    async setup(notu: Notu): Promise<void> {
        await CommonSpaceSetup.setup(notu);
        this._load(notu);
    }

    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
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