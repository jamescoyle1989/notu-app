import { RefreshAction, ShowErrorAction, UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu } from "notu";
import { PageData } from "./PageNoteTagData";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export class DeleteDisplayedNotesProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != defs.deleteDisplayedNotesProcess ||
            noteTag.tag.space.internalName != defs.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new DeleteDisplayedNotesProcessData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): DeleteDisplayedNotesProcessData {
        return new DeleteDisplayedNotesProcessData(note.addTag(systemSpace.deleteDisplayedNotesProcess));
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const systemSpace = new SystemSpace(notu);
        const pageData = note.getTagData(systemSpace.page, PageData);
        if (!pageData)
            return new ShowErrorAction('The Delete Displayed Notes Process expects to be added to a page, which it can then access the data of when run.');
        
        const notes = await notu.getNotes(pageData.query, pageData.searchAllSpaces ? null : note.space.id);
        await notu.saveNotes(notes.filter(x => !x.ownTag?.isInternal).map(x => x.delete()));
        return new RefreshAction();
    }
}