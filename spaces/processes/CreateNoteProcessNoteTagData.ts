import { areArraysDifferent } from "@/helpers/RenderHelpers";
import { Note, NoteTag } from "notu";
import { ProcessesSpace } from "./ProcessesSpace";
import { ProcessesSpaceSetup } from "./ProcessesSpaceSetup";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";

export class CreateNoteProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != ProcessesSpaceSetup.createNoteProcess ||
            noteTag.tag.space.internalName != ProcessesSpaceSetup.internalName
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
    static addTag(note: Note, processesSpace: ProcessesSpace): CreateNoteProcessData {
        return new CreateNoteProcessData(note.addTag(processesSpace.createNoteProcess));
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
}