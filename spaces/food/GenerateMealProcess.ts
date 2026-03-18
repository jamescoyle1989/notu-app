import { Note, Notu, Space } from "notu";
import { FoodSpace } from "./FoodSpace";
import { GenerateMealProcessData } from "./GenerateMealProcessNoteTagData";
import { MealData, MealGroupData, MealIngredientData, MealStepData } from "./MealNoteTagData";
import { RecipeData } from "./RecipeNoteTagData";

export class GenerateMealProcessContext {
    private _notu: Notu;

    private _food: FoodSpace;
    get foodSpace(): FoodSpace { return this._food; }

    constructor(processData: GenerateMealProcessData, notu: Notu) {
        this._notu = notu;
        this._food = new FoodSpace(notu);
        this._processData = processData;
    }

    private _processData: GenerateMealProcessData;
    getSpaceToSaveMealTo(): Space {
        const spaceId = this._processData.saveMealToSpaceId;
        return this._notu.getSpace(spaceId);
    }
}


export function generateMeal(
    recipe: Note,
    includedOptionalIds: Array<number>,
    context: GenerateMealProcessContext
): Note {

    const recipeData = recipe.getTagData(context.foodSpace.recipe, RecipeData);
    if (!recipeData)
        throw new Error('The Generate Meal process must be run on a recipe note.');

    const groups = recipeData.groups.filter(group => 
        !group.optional ||
        includedOptionalIds.includes(group.id)
    );
    const idHash = new Set<number>(groups.map(x => x.id));

    const ingredients = recipeData.ingredients.filter(ing =>
        ing.groupId == null ||
        idHash.has(ing.groupId)
    ).filter(ing =>
        !ing.optional ||
        includedOptionalIds.includes(ing.id)
    );
    for (const ing of ingredients)
        idHash.add(ing.id);

    const steps = recipeData.steps.filter(step => {
        if (step.condition.length == 0)
            return true;
        if (step.condition.length == 1) {
            if (!idHash.has(step.condition[0]))
                return false;
        }
        for (const conditionId of step.condition) {
            const conditionMet = idHash.has(conditionId);
            if (conditionMet) {
                if (step.conditionType == 'OR')
                    return true;
            }
            else if (step.conditionType == 'AND')
                return false;
        }
        if (step.conditionType == 'OR')
            return false;
        return true;
    });

    const meal = new Note(recipe.text)
        .in(context.getSpaceToSaveMealTo());
    if (!!recipe.ownTag)
        meal.addTag(recipe.ownTag);
    const mealData = MealData.addTag(meal, context.foodSpace);
    mealData.name = recipeData.name;
    mealData.servings = recipeData.servings;

    const groupIdMap = new Map<number, number>();
    for (const recipeGroup of groups) {
        const mealGroup = new MealGroupData(meal.getTag(context.foodSpace.meal));
        mealGroup.name = recipeGroup.name;
        mealData.addGroup(mealGroup);
        groupIdMap.set(recipeGroup.id, mealGroup.id);
    }

    for (const recipeIngredient of ingredients) {
        const mealIngredient = new MealIngredientData(meal.getTag(context.foodSpace.meal));
        mealIngredient.name = recipeIngredient.name;
        mealIngredient.quantity = recipeIngredient.quantity;
        if (!!recipeIngredient.groupId)
            mealIngredient.groupId = groupIdMap.get(recipeIngredient.groupId);
        mealData.addIngredient(mealIngredient);
    }

    for (const recipeStep of steps) {
        let stepText = recipeStep.text;
        const mealStep = new MealStepData(meal.getTag(context.foodSpace.meal));
        mealStep.text = stepText;
        mealData.addStep(mealStep);
    }

    return meal;
}