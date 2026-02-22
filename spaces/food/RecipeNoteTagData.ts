import { areArraysDifferent } from "@/helpers/RenderHelpers";
import { maxBy, minBy } from "es-toolkit";
import { Note, NoteTag } from "notu";
import { FoodSpace } from "./FoodSpace";
import { FoodSpaceSetup } from "./FoodSpaceSetup";

export class RecipeData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != FoodSpaceSetup.recipe ||
            noteTag.tag.space.internalName != FoodSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.name = this.name;
        this.servings = this.servings;
        this._nt.data.groups = this._nt.data.groups ?? [];
        this._nt.data.ingredients = this._nt.data.ingredients ?? [];
        this._nt.data.steps = this._nt.data.steps ?? [];
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new RecipeData(noteTag);
    }
    static addTag(note: Note, foodSpace: FoodSpace): RecipeData {
        return new RecipeData(note.addTag(foodSpace.recipe));
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

    get groups(): Array<RecipeGroupData> {
        return (this._nt.data.groups ?? []).map(x => new RecipeGroupData(this._nt, x));
    }
    addGroup(group: RecipeGroupData): RecipeGroupData {
        group.id = (minBy(this.groups, x => x.id)?.id ?? 0) - 1;
        this._nt.data.groups.push(group.data);
        if (this._nt.isClean)
            this._nt.dirty();
        return group;
    }
    removeGroup(groupId: number) {
        this._nt.data.groups = this.groups.filter(x => x.id != groupId).map(x => x.data);
        const ingredients = this.ingredients;
        const ingredientIdsToDelete = ingredients.filter(x => x.groupId == groupId).map(x => x.id);
        this._nt.data.ingredients = ingredients.filter(x => x.groupId != groupId).map(x => x.data);
        for (const step of this.steps)
            step.condition = step.condition.filter(x => x != groupId && ingredientIdsToDelete.includes(groupId));
        if (this._nt.isClean)
            this._nt.dirty();
    }

    get ingredients(): Array<RecipeIngredientData> {
        return (this._nt.data.ingredients ?? []).map(x => new RecipeIngredientData(this._nt, x));
    }
    addIngredient(ingredient: RecipeIngredientData): RecipeIngredientData {
        ingredient.id = (maxBy(this.ingredients, x => x.id)?.id ?? 0) + 1;
        this._nt.data.ingredients.push(ingredient.data);
        if (this._nt.isClean)
            this._nt.dirty();
        return ingredient;
    }
    removeIngredient(ingredientId: number) {
        this._nt.data.ingredients = this.ingredients.filter(x => x.id != ingredientId).map(x => x.data);
        for (const step of this.steps)
            step.condition = step.condition.filter(x => x != ingredientId);
        if (this._nt.isClean)
            this._nt.dirty();
    }

    get steps(): Array<RecipeStepData> {
        return (this._nt.data.steps ?? []).map(x => new RecipeStepData(this._nt, x));
    }
    addStep(step: RecipeStepData): RecipeStepData {
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


export class RecipeGroupData {
    private _nt: NoteTag;
    private _groupData: any;
    constructor(noteTag: NoteTag, groupData: any = null) {
        this._nt = noteTag;
        this._groupData = groupData ?? {};
        this.id = this.id;
        this.name = this.name;
        this.optional = this.optional;
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

    get optional(): boolean { return this._groupData.optional; }
    set optional(value: boolean) {
        value = value ?? false;
        if (this._groupData.optional != value && this._nt.isClean)
            this._nt.dirty();
        this._groupData.optional = value;
    }
}


export class RecipeIngredientData {
    private _nt: NoteTag;
    private _ingredientData: any;
    constructor(noteTag: NoteTag, groupData: any = null) {
        this._nt = noteTag;
        this._ingredientData = groupData ?? {};
        this.id = this.id;
        this.name = this.name;
        this.optional = this.optional;
        this.quantity = this.quantity;
        this.alias = this.alias;
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

    get optional(): boolean { return this._ingredientData.optional; }
    set optional(value: boolean) {
        value = value ?? false;
        if (this._ingredientData.optional != value && this._nt.isClean)
            this._nt.dirty();
        this._ingredientData.optional = value;
    }

    get quantity(): string { return this._ingredientData.quantity; }
    set quantity(value: string) {
        value = value ?? '';
        if (this._ingredientData.name != value && this._nt.isClean)
            this._nt.dirty();
        this._ingredientData.quantity = value;
    }

    get alias(): string | null { return this._ingredientData.alias; }
    set alias(value: string | null) {
        value = value ?? '';
        if (value.trim() == '')
            value = null;
        if (this._ingredientData.alias != value && this._nt.isClean)
            this._nt.dirty();
        this._ingredientData.alias = value;
    }

    get groupId(): number | null { return this._ingredientData.groupId; }
    set groupId(value: number | null) {
        value = value ?? null;
        if (this._ingredientData.groupId != value && this._nt.isClean)
            this._nt.dirty();
        this._ingredientData.groupId = value;
    }
}


export class RecipeStepData {
    private _nt: NoteTag;
    private _stepData: any;
    constructor(noteTag: NoteTag, stepData: any = null) {
        this._nt = noteTag;
        this._stepData = stepData ?? {};
        this.text = this.text;
        this.condition = this.condition;
        this.conditionType = this.conditionType;
    }

    get data(): any { return this._stepData; }

    get text(): string { return this._stepData.text; }
    set text(value: string) {
        value = value ?? '';
        if (this._stepData.text != value && this._nt.isClean)
            this._nt.dirty();
        this._stepData.text = value;
    }

    get condition(): Array<number> { return this._stepData.condition; }
    set condition(value: Array<number>) {
        value = value ?? [];
        if (areArraysDifferent(value, this._stepData.condition) && this._nt.isClean)
            this._nt.dirty();
        this._stepData.condition = value;
    }

    get conditionType(): 'AND' | 'OR' { return this._stepData.conditionType; }
    set conditionType(value: 'AND' | 'OR') {
        value = value ?? 'AND';
        if (this._stepData.conditionType != value && this._nt.isClean)
            this._nt.dirty();
        this._stepData.conditionType = value;
    }
}