import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { RemoveFinishedChecklistItemsProcessData } from "./RemoveFinishedChecklistItemsProcessNoteTagData";
import defs from "./SystemSpaceDefs";

export default class RemoveFinishedChecklistItemsProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return null;
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new RemoveFinishedChecklistItemsProcessData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == defs.internalName &&
            tag.name == defs.removeFinishedChecklistItemsProcess;
    }
}