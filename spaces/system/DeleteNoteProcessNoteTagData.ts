import { RefreshAction, ShowErrorAction, UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export class DeleteNoteProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != defs.deleteNoteProcess ||
            noteTag.tag.space.internalName != defs.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new DeleteNoteProcessData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): DeleteNoteProcessData {
        return new DeleteNoteProcessData(note.addTag(systemSpace.deleteNoteProcess));
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        if (note.ownTag?.isInternal)
            return new ShowErrorAction('Cannot delete notes marked as internal. These are crucial for the stability of the space they belong to.');
        await notu.saveNotes([note.delete()]);
        return new RefreshAction();
    }
}