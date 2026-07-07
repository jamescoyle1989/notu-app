import { RefreshAction, UIAction } from "@/helpers/NoteAction";
import { getPasswordCache } from "@/helpers/PasswordCache";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export class ForgetPasswordProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != defs.forgetPasswordProcess ||
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
        return new ForgetPasswordProcessData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): ForgetPasswordProcessData {
        return new ForgetPasswordProcessData(note.addTag(systemSpace.forgetPasswordProcess));
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
            throw Error(`Cannot call Forget Password process for a note which doesn't have password protection added to it.`);

        const passwordCache = getPasswordCache();
        passwordCache.forget(passwordNT.tag.id, this.forAllNotes ? null : note.id);
        return new RefreshAction();
    }
}