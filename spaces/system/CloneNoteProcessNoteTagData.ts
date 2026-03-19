import { ShowEditorAction, UIAction } from "@/helpers/NoteAction";
import { areArraysDifferent } from "@/helpers/RenderHelpers";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export class CloneNoteProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != defs.cloneNoteProcess ||
            noteTag.tag.space.internalName != defs.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
        this.spaceId = this.spaceId;
        this.addTagIds = this.addTagIds;
        this.removeTagIds = this.removeTagIds;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new CloneNoteProcessData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): CloneNoteProcessData {
        return new CloneNoteProcessData(note.addTag(systemSpace.cloneNoteProcess));
    }

    get spaceId(): number { return this._nt.data.spaceId; }
    set spaceId(value: number) {
        value = value ?? -1;
        if (this._nt.data.spaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.spaceId = value;
    }

    get addTagIds(): Array<number> { return this._nt.data.addTagIds; }
    set addTagIds(value: Array<number>) {
        value = value ?? [];
        if (areArraysDifferent(value, this._nt.data.addTagIds) && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.addTagIds = value;
    }

    get removeTagIds(): Array<number> { return this._nt.data.removeTagIds; }
    set removeTagIds(value: Array<number>) {
        value = value ?? [];
        if (areArraysDifferent(value, this._nt.data.removeTagIds) && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.removeTagIds = value;
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const newNote = note.duplicateAsNew();
        if (this.spaceId > 0)
            newNote.space = notu.getSpace(this.spaceId);
        for (const tagId of this.removeTagIds) {
            const tag = notu.getTag(tagId);
            if (!!tag)
                newNote.removeTag(tag);
        }
        for (const tagId of this.addTagIds) {
            const tag = notu.getTag(tagId);
            if (!!tag)
                newNote.addTag(tag);
        }
        return new ShowEditorAction(newNote);
    }
}