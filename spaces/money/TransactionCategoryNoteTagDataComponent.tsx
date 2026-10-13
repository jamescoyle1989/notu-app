import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { MoneySpaceSetup } from "./MoneySpaceSetup";
import { TransactionCategoryData } from "./TransactionCategoryData";

export default class TransactionCategoryNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new TransactionCategoryData(noteTag);
        return (<NotuText color={textColor} small>{data.value.toFixed(2)}</NotuText>)
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return null;
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new TransactionCategoryData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return !!note.tags.find(x =>
            x.tag.space.internalName == MoneySpaceSetup.internalName &&
            x.tag.name == MoneySpaceSetup.transaction
        ) &&
        !!tag.links.find(x =>
            x.space.internalName == MoneySpaceSetup.internalName &&
            x.name == MoneySpaceSetup.budgetCategory
        );
    }
}