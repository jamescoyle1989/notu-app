import { areArraysDifferent } from "@/helpers/RenderHelpers";
import { Note, NoteTag, Tag } from "notu";
import { FitnessSpaceSetup } from "./FitnessSpaceSetup";

export class ExerciseMetricDefData {
    private _nt: NoteTag;
    private _isLoading = true;
    constructor(noteTag: NoteTag) {
        if (
            !noteTag.tag.links.find(x =>
                x.name == FitnessSpaceSetup.metric &&
                x.space.internalName == FitnessSpaceSetup.internalName
            )
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.mode = this.mode;
        this._isLoading = false;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new ExerciseMetricDefData(noteTag);
    }
    static addTag(note: Note, metric: Tag): ExerciseMetricDefData {
        return new ExerciseMetricDefData(note.addTag(metric))
    }


    get mode(): 'Constant' | 'Range' | 'Set' { return this._nt.data.mode; }
    set mode(value: 'Constant' | 'Range' | 'Set') {
        if (value == undefined)
            value = 'Constant';
        if (this._nt.data.mode != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.mode = value;
        this.value = this.value;
        this.min = this.min;
        this.max = this.max;
        this.increment = this.increment;
        this.values = this.values;
    }


    get value(): number { return this._nt.data.value; }
    set value(value: number) {
        value = value ?? 0;
        if (this.mode != 'Constant')
            value = null;
        if (this._nt.data.value != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.value = value;
    }


    get min(): number { return this._nt.data.min; }
    set min(value: number) {
        value = value ?? 0;
        if (this.mode != 'Range')
            value = null;
        if (this._nt.data.min != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.min = value;
        this._updateIncrementSign();
    }

    get max(): number { return this._nt.data.max; }
    set max(value: number) {
        value = value ?? 0;
        if (this.mode != 'Range')
            value = null;
        if (this._nt.data.max != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.max = value;
        this._updateIncrementSign();
    }

    private _updateIncrementSign() {
        if (this._isLoading)
            return;
        if (this.min < this.max && this.increment < 0)
            this.increment = -this.increment;
        else if (this.min > this.max && this.increment > 0)
            this.increment = -this.increment;
    }

    get increment(): number { return this._nt.data.increment; }
    set increment(value: number) {
        value = value ?? 1;
        if (this.mode != 'Range')
            value = null;
        else if (value == 0)
            value = (this.increment > 0) ? -1 : 1;
        if (this._nt.data.increment != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.increment = value;
        this._updateIncrementSign();
    }


    get values(): Array<number> { return this._nt.data.values; }
    set values(value: Array<number>) {
        value = value ?? [];
        if (this.mode != 'Set')
            value = null;
        if (areArraysDifferent(value, this._nt.data.values) && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.values = value;
    }


    getAllowedValues(): Array<number> {
        if (this.mode == 'Constant')
            return [this.value];

        if (this.mode == 'Set')
            return [...this.values];

        if (this.mode == 'Range') {
            if (this.increment == 0)
                throw Error('Unable to generate allowed values range with zero increment');
            let position = this.min;
            const output = [position];
            while (true) {
                position = position + this.increment;
                if (this.increment > 0 && position > this.max)
                    break;
                if (this.increment < 0 && position < this.max)
                    break;
                output.push(position);
            }
            return output;
        }

        if (this.mode == 'Calculation')
            return [];

        throw Error('Unknown metric mode type');
    }
}