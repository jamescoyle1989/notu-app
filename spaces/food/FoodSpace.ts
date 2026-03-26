import { Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { FoodSpaceSetup } from "./FoodSpaceSetup";

export class FoodSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _recipe: Tag;
    get recipe(): Tag { return this._recipe; }

    private _meal: Tag;
    get meal(): Tag { return this._meal; }

    private _generateMealProcess: Tag;
    get generateMealProcess(): Tag { return this._generateMealProcess; }

    private _generateShoppingListProcess: Tag;
    get generateShoppingListProcess(): Tag { return this._generateShoppingListProcess; }

    private _ingredientFilter: Tag;
    get ingredientFilter(): Tag { return this._ingredientFilter; }

    
    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(FoodSpaceSetup.internalName);
        this._recipe = notu.getTagByName(FoodSpaceSetup.recipe, this._space);
        this._meal = notu.getTagByName(FoodSpaceSetup.meal, this._space);
        this._generateMealProcess = notu.getTagByName(FoodSpaceSetup.generateMealProcess, this._space);
        this._generateShoppingListProcess = notu.getTagByName(FoodSpaceSetup.generateShoppingListProcess, this._space);
        this._ingredientFilter = notu.getTagByName(FoodSpaceSetup.ingredientFilter, this._space);
    }
}