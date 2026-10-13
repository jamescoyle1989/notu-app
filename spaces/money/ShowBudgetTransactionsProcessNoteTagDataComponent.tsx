import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { MoneySpaceSetup } from "./MoneySpaceSetup";
import { ShowBudgetTransactionsProcessData } from "./ShowBudgetTransactionsProcessNoteTagData";

export default class ShowBudgetTransactionsProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }
    
    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return null;
    }
    
    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
    
    getDataObject(noteTag: NoteTag, note: Note) {
        return new ShowBudgetTransactionsProcessData(noteTag);
    }
    
    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == MoneySpaceSetup.internalName &&
            tag.name == MoneySpaceSetup.showBudgetTransactionsProcess;
    }
}