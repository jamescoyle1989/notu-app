import { RefreshAction, ShowEditorAction, UIAction } from "@/helpers/NoteAction";
import { areArraysDifferent } from "@/helpers/RenderHelpers";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import { SystemSpaceSetup } from "./SystemSpaceSetup";

export class EditNoteProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != SystemSpaceSetup.editNoteProcess ||
            noteTag.tag.space.internalName != SystemSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
        this.spaceId = this.spaceId;
        this.addTagIds = this.addTagIds;
        this.removeTagIds = this.removeTagIds;
        if (!!noteTag.data.editorSettings)
            this._editorSettings = new EditNoteEditorSettings(noteTag);
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new EditNoteProcessData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): EditNoteProcessData {
        return new EditNoteProcessData(note.addTag(systemSpace.editNoteProcess));
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

    private _editorSettings: EditNoteEditorSettings;
    get editorSettings(): EditNoteEditorSettings {
        if (!!this._editorSettings && !this.hasEditorSettings)
            this._editorSettings = null;
        else if (!this._editorSettings && this.hasEditorSettings)
            this._editorSettings = new EditNoteEditorSettings(this._nt);
        return this._editorSettings;
    }

    get hasEditorSettings(): boolean { return !!this._nt.data.editorSettings; }
    set hasEditorSettings(value: boolean) {
        if (value && !this.hasEditorSettings) {
            this._nt.data.editorSettings = {};
            this._editorSettings = new EditNoteEditorSettings(this._nt);
        }
        else if (!value && this.hasEditorSettings) {
            this._nt.data.editorSettings = null;
            this._editorSettings = null;
        }
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        if (this.spaceId > 0)
            note.space = notu.getSpace(this.spaceId);
        for (const tagId of this.removeTagIds) {
            const tag = notu.getTag(tagId);
            if (!!tag)
                note.removeTag(tag);
        }
        for (const tagId of this.addTagIds) {
            const tag = notu.getTag(tagId);
            if (!!tag)
                note.addTag(tag);
        }
        if (!this.hasEditorSettings) {
            await notu.saveNotes([note]);
            new RefreshAction();
        }
        const editSet = this.editorSettings;
        return new ShowEditorAction(note)
            .withPermissions(editSet.canEditSpace, editSet.canEditOwnTag, editSet.canEditText, editSet.canEditTags);
    }
}


export class EditNoteEditorSettings {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        this._nt = noteTag;
        this.canEditText = this.canEditText;
        this.canEditTags = this.canEditTags;
        this.canEditOwnTag = this.canEditOwnTag;
        this.canEditSpace = this.canEditSpace;
    }

    get data(): any { return this._nt.data.editorSettings; }

    get canEditText(): boolean { return this.data.canEditText; }
    set canEditText(value: boolean) {
        value = value ?? true;
        if (this.data.canEditText != value && this._nt.isClean)
            this._nt.dirty();
        this.data.canEditText = value;
    }

    get canEditTags(): boolean { return this.data.canEditTags; }
    set canEditTags(value: boolean) {
        value = value ?? true;
        if (this.data.canEditTags != value && this._nt.isClean)
            this._nt.dirty();
        this.data.canEditTags = value;
    }

    get canEditOwnTag(): boolean { return this.data.canEditOwnTag; }
    set canEditOwnTag(value: boolean) {
        value = value ?? true;
        if (this.data.canEditOwnTag != value && this._nt.isClean)
            this._nt.dirty();
        this.data.canEditOwnTag = value;
    }

    get canEditSpace(): boolean { return this.data.canEditSpace; }
    set canEditSpace(value: boolean) {
        value = value ?? true;
        if (this.data.canEditSpace != value && this._nt.isClean)
            this._nt.dirty();
        this.data.canEditSpace = value;
    }
}