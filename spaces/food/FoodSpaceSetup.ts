import { Note, Notu, Space } from "notu";

export class FoodSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.food'; }
    static get recipe(): string { return 'Recipe'; }
    static get meal(): string { return 'Meal'; }

    static async setup(notu: Notu): Promise<void> {
        let foodSpace = notu.getSpaceByInternalName(this.internalName);
        if (!foodSpace) {
            foodSpace = new Space('Food').v('1.0.0');
            foodSpace.internalName = this.internalName;
            await notu.saveSpace(foodSpace);

            const recipe = new Note(`Adding this tag to a note marks that it represents a recipe. A recipe is used for generating meals. As such, a recipe is designed to be a flexible blueprint which can easily be varied between uses. Recipes include a list of ingredients, each of which can be toggled as optional, and also grouped together as components of the overall dish. They also include a list of steps, each of which can be set to only be included if particular optional ingredients have been included.`)
                .in(foodSpace).setOwnTag(this.recipe);
            recipe.ownTag.asInternal();

            const meal = new Note(`Meals get generated from recipes. When generating a meal you get to toggle any optional ingredients that the recipe has. The meal will then be created with only the required ingredients and steps included. The meal tag also provides a nice interface for checking off items as you work through preparing it. You can also easily generate shopping lists from meals.`)
                .in(foodSpace).setOwnTag(this.meal);
            meal.ownTag.asInternal();

            await notu.saveNotes([recipe, meal]);
        }
    }
}