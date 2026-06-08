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
        this._updateRandomisedValue();
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new ExerciseMetricDefData(noteTag);
    }
    static addTag(note: Note, metric: Tag): ExerciseMetricDefData {
        return new ExerciseMetricDefData(note.addTag(metric))
    }


    private _isSwitchingMode = false;
    get mode(): 'Range' | 'Set' { return this._nt.data.mode; }
    set mode(value: 'Range' | 'Set') {
        if (value == undefined)
            value = 'Range';
        if (this._nt.data.mode == value)
            return;
        this._isSwitchingMode = true;
        if (this._nt.isClean)
            this._nt.dirty();
        this._nt.data.mode = value;
        this.min = this.min;
        this.max = this.max;
        this.increment = this.increment;
        this.values = this.values;
        if (!this._isLoading)
            this._updateRandomisedValue();
        this._isSwitchingMode = false;
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
        if (!this._isLoading && !this._isSwitchingMode)
            this._updateRandomisedValue();
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
        if (!this._isLoading && !this._isSwitchingMode)
            this._updateRandomisedValue();
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
        if (!this._isLoading && !this._isSwitchingMode)
            this._updateRandomisedValue();
    }


    get values(): Array<number> { return this._nt.data.values; }
    set values(value: Array<number>) {
        value = value ?? [];
        if (this.mode != 'Set')
            value = null;
        if (areArraysDifferent(value, this._nt.data.values) && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.values = value;
        if (!this._isLoading && !this._isSwitchingMode)
            this._updateRandomisedValue();
    }


    // Generally on each exercise that gets generated, there'll be some kind of description which will use calculations on some of the exercise metric values
    // This description is inherited from the Exercise template, which will have metrics attached to it which use this Def version of the notetag data
    // The Def version doesn't naturally have a value property on it, whereas that's the key value which gets held in the notetag data of metrics attached to generated exercises
    // As a result, this just makes sure that we do have a value property on here too. It's not really providing much use within the class itself, but it means that calculations can have a 'value' property to work with
    private _updateRandomisedValue() {
        const values = this.getAllowedValues();
        if (values.length == 0)
            return;
        this._nt.data.value = values[Math.floor(Math.random() * values.length)];
        if (this._nt.isClean)
            this._nt.dirty();
    }


    getAllowedValues(): Array<number> {
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

        throw Error('Unknown metric mode type');
    }
}