import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export default class PasswordProtectionRefNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return null;
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        const systemSpace = new SystemSpace(notu);
        if (note.tags.filter(x => x.tag.linksTo(systemSpace.passwordProtection)).length > 1)
            throw new Error(`Can't link a note to more than one password protection notes.`);

        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag, note: Note) {
        return null;
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return !!tag.links.find(x => 
            x.name == defs.passwordProtection &&
            x.space.internalName == defs.internalName
        );
    }
}