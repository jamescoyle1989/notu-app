import { Note, Notu } from "notu";
import { SystemSpace } from "../system/SystemSpace";

export class FoodSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.food'; }
    static get recipe(): string { return 'Recipe'; }
    static get meal(): string { return 'Meal'; }
    static get generateMealProcess(): string { return 'Generate Meal Process'; }
    static get generateShoppingListProcess(): string { return 'Generate Shopping List Process'; }
    static get ingredientFilter(): string { return 'Ingredient Filter'; }

    static async setup(notu: Notu): Promise<void> {
        let foodSpace = notu.getSpaceByInternalName(this.internalName);
        if (!foodSpace)
            return;
        if (foodSpace.version == '0.0.0') {
            foodSpace.version = '1.0.0';
            await notu.saveSpace(foodSpace);

            const recipe = new Note(`Adding this tag to a note marks that it represents a recipe. A recipe is used for generating meals. As such, a recipe is designed to be a flexible blueprint which can easily be varied between uses. Recipes include a list of ingredients, each of which can be toggled as optional, and also grouped together as components of the overall dish. They also include a list of steps, each of which can be set to only be included if particular optional ingredients have been included.`)
                .in(foodSpace).setOwnTag(this.recipe);
            recipe.ownTag.asInternal();

            const meal = new Note(`Meals get generated from recipes. When generating a meal you get to toggle any optional ingredients that the recipe has. The meal will then be created with only the required ingredients and steps included. The meal tag also provides a nice interface for checking off items as you work through preparing it. You can also easily generate shopping lists from meals.`)
                .in(foodSpace).setOwnTag(this.meal);
            meal.ownTag.asInternal();

            await notu.saveNotes([recipe, meal]);
        
            const systemSpace = new SystemSpace(notu);

            const generateMealProcess = new Note(`This process will run against a recipe note and use it to generate a meal note from it. It will display a UI where you can select when the meal will be scheduled and also any optional ingredients that you want to include.`)
                .in(foodSpace).setOwnTag(this.generateMealProcess);
            generateMealProcess.ownTag.asInternal();
            generateMealProcess.addTag(systemSpace.process);

            const generateShoppingListProcess = new Note(`This process will run against a collection of scheduled meals. It displays a UI where you can choose which meals you would like to include in the list. The process allows you to configure what tags the shopping list note should be set up with, also what criteria to look for if you want it to append to an existing note.`)
                .in(foodSpace).setOwnTag(this.generateShoppingListProcess);
            generateShoppingListProcess.ownTag.asInternal();
            generateShoppingListProcess.addTag(systemSpace.process);

            const ingredientFilter = new Note(`This filter allows for filtering recipe/meal search results by whether they contain a particular ingredient.`)
                .in(foodSpace).setOwnTag(this.ingredientFilter);
            ingredientFilter.ownTag.asInternal();
            ingredientFilter.addTag(systemSpace.filter);

            await notu.saveNotes([generateMealProcess, generateShoppingListProcess, ingredientFilter]);
        }
    }
}