import { Note, NoteTag } from "notu";
import { CommonSpace } from "./CommonSpace";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class PageData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.page ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.name = this.name;
        this.group = this.group;
        this.order = this.order;
        this.query = this.query;
        this.searchAllSpaces = this.searchAllSpaces;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new PageData(noteTag);
    }
    static addTag(note: Note, commonSpace: CommonSpace): PageData {
        return new PageData(note.addTag(commonSpace.page));
    }

    get name(): string { return this._nt.data.name; }
    set name(value: string) {
        value = value ?? '';
        if (this._nt.data.name != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.name = value;
    }

    get group(): string { return this._nt.data.group; }
    set group(value: string) {
        value = value ?? '';
        if (this._nt.data.group != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.group = value;
    }

    get order(): number { return this._nt.data.order; }
    set order(value: number) {
        value = value ?? 1;
        if (this._nt.data.order != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.order = value;
    }

    get query(): string { return this._nt.data.query; }
    set query(value: string) {
        value = value ?? '';
        if (this._nt.data.query != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.query = value;
    }

    get searchAllSpaces(): boolean { return this._nt.data.searchAllSpaces; }
    set searchAllSpaces(value: boolean) {
        value = value ?? false;
        if (this._nt.data.searchAllSpaces != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.searchAllSpaces = value;
    }
}