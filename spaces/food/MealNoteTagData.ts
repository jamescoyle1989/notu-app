import { maxBy, minBy } from "es-toolkit";
import { Note, NoteTag } from "notu";
import { FoodSpace } from "./FoodSpace";
import { FoodSpaceSetup } from "./FoodSpaceSetup";

export class MealData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != FoodSpaceSetup.meal ||
            noteTag.tag.space.internalName != FoodSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.name = this.name;
        this.servings = this.servings;
        this.hideDoneItems = this.hideDoneItems;
        this._nt.data.groups = this._nt.data.groups ?? [];
        this._nt.data.ingredients = this._nt.data.ingredients ?? [];
        this._nt.data.steps = this._nt.data.steps ?? [];
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new MealData(noteTag);
    }
    static addTag(note: Note, foodSpace: FoodSpace): MealData {
        return new MealData(note.addTag(foodSpace.meal));
    }

    get name(): string { return this._nt.data.name; }
    set name(value: string) {
        value = value ?? '';
        if (this._nt.data.name != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.name = value;
    }

    get servings(): number { return this._nt.data.servings; }
    set servings(value: number) {
        value = Math.max(1, value ?? 1);
        if (this._nt.data.servings != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.servings = value;
    }

    get hideDoneItems(): boolean { return this._nt.data.hideDoneItems; }
    set hideDoneItems(value: boolean) {
        value = value ?? false;
        if (this._nt.data.hideDoneItems != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.hideDoneItems = value;
    }

    get groups(): Array<MealGroupData> {
        return (this._nt.data.groups ?? []).map(x => new MealGroupData(this._nt, x));
    }
    addGroup(group: MealGroupData): MealGroupData {
        group.id = (minBy(this.groups, x => x.id)?.id ?? 0) - 1;
        this._nt.data.groups.push(group.data);
        if (this._nt.isClean)
            this._nt.dirty();
        return group;
    }
    removeGroup(groupId: number) {
        this._nt.data.groups = this.groups.filter(x => x.id != groupId).map(x => x.data);
        const ingredients = this.ingredients;
        this._nt.data.ingredients = ingredients.filter(x => x.groupId != groupId).map(x => x.data);
        if (this._nt.isClean)
            this._nt.dirty();
    }

    get ingredients(): Array<MealIngredientData> {
        return (this._nt.data.ingredients ?? []).map(x => new MealIngredientData(this._nt, x));
    }
    addIngredient(ingredient: MealIngredientData): MealIngredientData {
        ingredient.id = (maxBy(this.ingredients, x => x.id)?.id ?? 0) + 1;
        this._nt.data.ingredients.push(ingredient.data);
        if (this._nt.isClean)
            this._nt.dirty();
        return ingredient;
    }
    removeIngredient(ingredientId: number) {
        this._nt.data.ingredients = this.ingredients.filter(x => x.id != ingredientId).map(x => x.data);
        if (this._nt.isClean)
            this._nt.dirty();
    }

    get steps(): Array<MealStepData> {
        return (this._nt.data.steps ?? []).map(x => new MealStepData(this._nt, x));
    }
    addStep(step: MealStepData): MealStepData {
        this._nt.data.steps.push(step.data);
        if (this._nt.isClean)
            this._nt.dirty();
        return step;
    }
    removeStep(stepIndex: number) {
        (this._nt.data.steps as Array<any>).splice(stepIndex, 1);
        if (this._nt.isClean)
            this._nt.dirty();
    }
}


export class MealGroupData {
    private _nt: NoteTag;
    private _groupData: any;
    constructor(noteTag: NoteTag, groupData: any = null) {
        this._nt = noteTag;
        this._groupData = groupData ?? {};
        this.id = this.id;
        this.name = this.name;
    }

    get data(): any { return this._groupData; }

    get id(): number { return this._groupData.id; }
    set id(value: number) {
        value = value ?? 0;
        if (this._groupData.id != value && this._nt.isClean)
            this._nt.dirty();
        this._groupData.id = value;
    }

    get name(): string { return this._groupData.name; }
    set name(value: string) {
        value = value ?? '';
        if (this._groupData.name != value && this._nt.isClean)
            this._nt.dirty();
        this._groupData.name = value;
    }
}


export class MealIngredientData {
    private _nt: NoteTag;
    private _ingredientData: any;
    constructor(noteTag: NoteTag, groupData: any = null) {
        this._nt = noteTag;
        this._ingredientData = groupData ?? {};
        this.id = this.id;
        this.name = this.name;
        this.quantity = this.quantity;
        this.done = this.done;
    }

    get data(): any { return this._ingredientData; }

    get id(): number { return this._ingredientData.id; }
    set id(value: number) {
        value = value ?? 0;
        if (this._ingredientData.id != value && this._nt.isClean)
            this._nt.dirty();
        this._ingredientData.id = value;
    }

    get name(): string { return this._ingredientData.name; }
    set name(value: string) {
        value = value ?? '';
        if (this._ingredientData.name != value && this._nt.isClean)
            this._nt.dirty();
        this._ingredientData.name = value;
    }

    get quantity(): string { return this._ingredientData.quantity; }
    set quantity(value: string) {
        value = value ?? '';
        if (this._ingredientData.name != value && this._nt.isClean)
            this._nt.dirty();
        this._ingredientData.quantity = value;
    }

    get groupId(): number | null { return this._ingredientData.groupId; }
    set groupId(value: number | null) {
        value = value ?? null;
        if (this._ingredientData.groupId != value && this._nt.isClean)
            this._nt.dirty();
        this._ingredientData.groupId = value;
    }

    get done(): boolean { return this._ingredientData.done; }
    set done(value: boolean) {
        value = value ?? false;
        if (this._ingredientData.done != value && this._nt.isClean)
            this._nt.dirty();
        this._ingredientData.done = value;
    }
}


export class MealStepData {
    private _nt: NoteTag;
    private _stepData: any;
    constructor(noteTag: NoteTag, stepData: any = null) {
        this._nt = noteTag;
        this._stepData = stepData ?? {};
        this.text = this.text;
        this.done = this.done;
    }

    get data(): any { return this._stepData; }

    get text(): string { return this._stepData.text; }
    set text(value: string) {
        value = value ?? '';
        if (this._stepData.text != value && this._nt.isClean)
            this._nt.dirty();
        this._stepData.text = value;
    }

    get done(): boolean { return this._stepData.done; }
    set done(value: boolean) {
        value = value ?? false;
        if (this._stepData.done != value && this._nt.isClean)
            this._nt.dirty();
        this._stepData.done = value;
    }
}