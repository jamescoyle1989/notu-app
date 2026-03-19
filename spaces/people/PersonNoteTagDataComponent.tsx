import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { PeopleSpaceSetup } from "./PeopleSpaceSetup";

export default class PersonNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(
        noteTag: NoteTag,
        note: Note,
        notu: Notu
    ): ReactNode {
        return null;
    }
    
    getEditorComponent(
        noteTag: NoteTag,
        note: Note,
        notu: Notu,
        refreshCallback: () => void
    ): ReactNode {
        return null;
    }
    
    validate(
        noteTag: NoteTag,
        note: Note,
        notu: Notu
    ): Promise<boolean> {
        if (!note.ownTag)
            throw new Error('The Circle tag requires that the note has its own tag set.');
        
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return null;
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == PeopleSpaceSetup.internalName &&
            tag.name == PeopleSpaceSetup.person;
    }
}