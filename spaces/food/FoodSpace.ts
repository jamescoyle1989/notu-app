import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { FoodSpaceSetup } from "./FoodSpaceSetup";
import GenerateMealProcessNoteTagDataComponentFactory from "./GenerateMealProcessNoteTagDataComponent";
import GenerateShoppingListProcessNoteTagDataComponentFactory from "./GenerateShoppingListProcessNoteTagDataComponent";
import MealNoteTagDataComponentFactory from "./MealNoteTagDataComponent";
import RecipeNoteTagDataComponentFactory from "./RecipeNoteTagDataComponent";

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

    
    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(FoodSpaceSetup.internalName);
        this._recipe = notu.getTagByName(FoodSpaceSetup.recipe, this._space);
        this._meal = notu.getTagByName(FoodSpaceSetup.meal, this._space);
        this._generateMealProcess = notu.getTagByName(FoodSpaceSetup.generateMealProcess, this._space);
        this._generateShoppingListProcess = notu.getTagByName(FoodSpaceSetup.generateShoppingListProcess, this._space);
    }


    async setup(notu: Notu): Promise<void> {
        await FoodSpaceSetup.setup(notu);
        this._load(notu);
    }
    

    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        if (tag.space.internalName == FoodSpaceSetup.internalName) {
            if (tag.name == FoodSpaceSetup.recipe)
                return new RecipeNoteTagDataComponentFactory();
            if (tag.name == FoodSpaceSetup.meal)
                return new MealNoteTagDataComponentFactory();
            if (tag.name == FoodSpaceSetup.generateMealProcess)
                return new GenerateMealProcessNoteTagDataComponentFactory();
            if (tag.name == FoodSpaceSetup.generateShoppingListProcess)
                return new GenerateShoppingListProcessNoteTagDataComponentFactory();
        }
        return null;
    }
}