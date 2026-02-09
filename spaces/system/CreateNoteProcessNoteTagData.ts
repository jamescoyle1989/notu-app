import { ShowEditorAction, UIAction } from "@/helpers/NoteAction";
import { areArraysDifferent } from "@/helpers/RenderHelpers";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import { SystemSpaceSetup } from "./SystemSpaceSetup";

export class CreateNoteProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != SystemSpaceSetup.createNoteProcess ||
            noteTag.tag.space.internalName != SystemSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
        this.text = this.text;
        this.spaceId = this.spaceId;
        this.tagIds = this.tagIds;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new CreateNoteProcessData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): CreateNoteProcessData {
        return new CreateNoteProcessData(note.addTag(systemSpace.createNoteProcess));
    }

    get text(): string { return this._nt.data.text; }
    set text(value: string) {
        value = value ?? '';
        if (this._nt.data.text != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.text = value;
    }

    get spaceId(): number { return this._nt.data.spaceId; }
    set spaceId(value: number) {
        value = value ?? 0;
        if (this._nt.data.spaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.spaceId = value;
    }

    get tagIds(): Array<number> { return this._nt.data.tagIds; }
    set tagIds(value: Array<number>) {
        value = value ?? [];
        if (areArraysDifferent(value, this._nt.data.tagIds) && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.tagIds = value;
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        note.space = notu.getSpace(this.spaceId);
        note.text = this.text;
        for (const tagId of this.tagIds) {
            const tag = notu.getTag(tagId);
            if (!!tag)
                note.addTag(tag);
        }
        return Promise.resolve(new ShowEditorAction(note));
    }
}