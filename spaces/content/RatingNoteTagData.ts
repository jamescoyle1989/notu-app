import { Note, NoteTag } from "notu";
import { ContentSpace } from "./ContentSpace";
import { ContentSpaceSetup } from "./ContentSpaceSetup";

export class RatingData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != ContentSpaceSetup.rating ||
            noteTag.tag.space.internalName != ContentSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.type = this.type;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new RatingData(noteTag);
    }
    static addTag(note: Note, ContentSpace: ContentSpace): RatingData {
        return new RatingData(note.addTag(ContentSpace.rating));
    }

    get type(): 'Percent' | 'Fraction' { return this._nt.data.type ?? 'Percent'; }
    set type(value: 'Percent' | 'Fraction') {
        value = value ?? 'Percent';
        if (this._nt.data.type == value)
            return;
        const oldType = this.type;
        const oldValue = this.value;
        const oldScale = this.scale;
        if (this._nt.isClean)
            this._nt.dirty();
        this._nt.data.type = value;
        //After effects
        if (this.type == 'Percent' && oldType == 'Fraction') {
            this._nt.data.scale = 100;
            this.value = Math.round((oldValue / oldScale) * 100);
            this.scale = this.scale;
        }
        else if (this.type == 'Fraction' && oldType == 'Percent') {
            this._nt.data.scale = 5;
            this.value /= 20;
            this.scale = this.scale;
        }
        else {
            this.value = this.value;
            this.scale = this.scale;
        }
    }

    get value(): number { return this._nt.data.value; }
    set value(val: number) {
        val = val ?? 0;
        if (this.type == 'Percent')
            val = Math.min(Math.max(0, val), 100);
        else if (this.type == 'Fraction')
            val = Math.min(Math.max(0, val), this.scale);
        if (this._nt.data.type != val && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.value = val;
    }

    get scale(): number { return this._nt.data.scale; }
    set scale(value: number) {
        value = value ?? 5;
        if (this.type == 'Fraction')
            value = Math.abs(value);
        else
            value = 100;
        if (this._nt.data.scale == value)
            return;
        const multiplier = (!value || !this.scale) ? 1 : value / this.scale;
        if (this._nt.isClean)
            this._nt.dirty();
        this._nt.data.scale = value;
        //After effects
        this.value *= multiplier;
    }
}