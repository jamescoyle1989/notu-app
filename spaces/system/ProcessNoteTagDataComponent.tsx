import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { SystemSpace } from "./SystemSpace";

export default class ProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return null;
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        if (!note.ownTag)
            throw Error('The Process tag requires that the note has its own tag set.');

        const systemSpace = new SystemSpace(notu);
        if (!!note.getTag(systemSpace.page))
            throw Error(`A note cannot have both Process & Page tags added to it.`);
        
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return null;
    }
}