import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { DeleteDisplayedNotesProcessData } from "./DeleteDisplayedNotesProcessNoteTagData";
import defs from "./SystemSpaceDefs";

export default class DeleteDisplayedNotesProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return null;
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        for (const nt of note.tags) {
            if (
                nt.tag.space.internalName == defs.internalName &&
                nt.tag.name == defs.page
            )
                return Promise.resolve(true);
        }
        throw new Error('Delete Displayed Notes Process expects to be added to a page definition.');
    }

    getDataObject(noteTag: NoteTag) {
        return new DeleteDisplayedNotesProcessData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == defs.internalName &&
            tag.name == defs.deleteDisplayedNotesProcess;
    }
}