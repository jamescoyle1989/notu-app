import { HideOverlayAction, RefreshAction, ShowErrorAction, ShowOverlayAction, UIAction } from "@/helpers/NoteAction";
import { getPasswordCache } from "@/helpers/PasswordCache";
import { Note, NoteTag, Notu } from "notu";
import { showPasswordForm } from "./EnterPasswordProcessUI";
import { PasswordProtectionData } from "./PasswordProtectionNoteTagData";
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

        const systemSpace = new SystemSpace(notu);
        const passwordNT = note.tags.find(x => x.tag.linksTo(systemSpace.passwordProtection));
        if (!passwordNT) {
            await notu.saveNotes([note.delete()]);
            return new RefreshAction();
        }

        const passwordCache = getPasswordCache();
        if (!!passwordCache.get(passwordNT.tag.id, note.id)) {
            await notu.saveNotes([note.delete()]);
            return new RefreshAction();
        }

        const passwordNote = (await notu.getNotes(`n.id = ${passwordNT.tag.id}`))[0];
        const passwordProtectionData = passwordNote.getTagData(systemSpace.passwordProtection, PasswordProtectionData);

        return new ShowOverlayAction(onUIAction => showPasswordForm(
            passwordNote.id,
            passwordProtectionData,
            note.id,
            () => this.finishProcessRun(note, notu, onUIAction)
        ));
    }

    async finishProcessRun(note: Note, notu: Notu, onUIAction: (action: UIAction) => void) {
        await notu.saveNotes([note.delete()]);
        onUIAction(new HideOverlayAction(new RefreshAction));
    }
}