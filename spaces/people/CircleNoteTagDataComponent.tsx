import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { PeopleSpaceSetup } from "./PeopleSpaceSetup";

export default class CircleNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
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
        
        if (!!note.tags.find(nt => 
            !!nt.tag.links.find(link => 
                link.space.internalName == PeopleSpaceSetup.internalName &&
                link.name == PeopleSpaceSetup.person
            )
        ))
            throw new Error(`If you want to link people to a circle, make sure the circle's tag is added to the person, not the other way around.`);

        return Promise.resolve(true);
    }
}