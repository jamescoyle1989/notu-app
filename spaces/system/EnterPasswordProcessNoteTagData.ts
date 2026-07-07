import { ShowOverlayAction, UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu } from "notu";
import { showPasswordForm } from "./EnterPasswordProcessUI";
import { PasswordProtectionData } from "./PasswordProtectionNoteTagData";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export class EnterPasswordProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != defs.enterPasswordProcess ||
            noteTag.tag.space.internalName != defs.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
        this.forAllNotes = this.forAllNotes;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new EnterPasswordProcessData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): EnterPasswordProcessData {
        return new EnterPasswordProcessData(note.addTag(systemSpace.enterPasswordProcess));
    }

    get forAllNotes(): boolean { return this._nt.data.forAllNotes; }
    set forAllNotes(value: boolean) {
        value = value ?? false;
        if (this._nt.data.forAllNotes != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.forAllNotes = value;
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const systemSpace = new SystemSpace(notu);
        const passwordNT = note.tags.find(x => x.tag.linksTo(systemSpace.passwordProtection));
        if (!passwordNT)
            throw Error(`Cannot call Enter Password process for a note which doesn't have password protection added to it.`);
        
        const passwordNote = (await notu.getNotes(`n.id = ${passwordNT.tag.id}`))[0];
        const passwordProtectionData = passwordNote.getTagData(systemSpace.passwordProtection, PasswordProtectionData);

        return new ShowOverlayAction(onUIAction => showPasswordForm(
            passwordNote.id,
            passwordProtectionData,
            this.forAllNotes ? null : note.id,
            onUIAction
        ));
    }
}