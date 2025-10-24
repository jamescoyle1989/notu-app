import { Note, NoteTag } from "notu";
import { CommonSpace } from "./CommonSpace";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export class AddressData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != CommonSpaceSetup.address ||
            noteTag.tag.space.internalName != CommonSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.name = this.name;
        this.url = this.url;
        this.coordinates = this.coordinates;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new AddressData(noteTag);
    }
    static addTag(note: Note, commonSpace: CommonSpace): AddressData {
        return new AddressData(note.addTag(commonSpace.address));
    }

    get name(): string { return this._nt.data.name; }
    set name(value: string) {
        value = value ?? '';
        if (this._nt.data.name != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.name = value;
    }

    get url(): string { return this._nt.data.url; }
    set url(value: string) {
        if (value != null) {
            value = value.trim();
            if (value == '')
                value = null;
        }
        if (this._nt.data.url != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.url = value;
    }

    get coordinates(): string { return this._nt.data.coordinates; }
    set coordinates(value: string) {
        if (value != null) {
            value = value.trim();
            if (value == '')
                value = null;
        }
        if (this._nt.data.coordinates != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.coordinates = value;
    }
}