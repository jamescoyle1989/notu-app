import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { FoodSpaceSetup } from "./FoodSpaceSetup";
import MealNoteTagDataComponentFactory from "./MealNoteTagDataComponent";
import RecipeNoteTagDataComponentFactory from "./RecipeNoteTagDataComponent";

export class FoodSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _recipe: Tag;
    get recipe(): Tag { return this._recipe; }

    private _meal: Tag;
    get meal(): Tag { return this._meal; }

    
    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(FoodSpaceSetup.internalName);
        this._recipe = notu.getTagByName(FoodSpaceSetup.recipe, this._space);
        this._meal = notu.getTagByName(FoodSpaceSetup.meal, this._space);
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
        }
        return null;
    }
}