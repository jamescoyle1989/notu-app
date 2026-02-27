import { NoteChecklist, NoteChecklistLine } from "@/notecomponents/NoteChecklist";
import { NoteText } from "@/notecomponents/NoteText";
import { Note, Notu, Space, Tag } from "notu";
import { CommonSpace } from "../common/CommonSpace";
import { FoodSpace } from "./FoodSpace";
import { GenerateShoppingListProcessData } from "./GenerateShoppingListProcessNoteTagData";
import { MealData } from "./MealNoteTagData";

export class GenerateShoppingListProcessContext {
    private _notu: Notu;

    private _food: FoodSpace;
    get foodSpace(): FoodSpace { return this._food; }

    private _common: CommonSpace;
    get commonSpace(): CommonSpace { return this._common; }

    constructor(processData: GenerateShoppingListProcessData, notu: Notu) {
        this._notu = notu;
        this._food = new FoodSpace(notu);
        this._common = new CommonSpace(notu);
        this._processData = processData;
    }

    private _processData: GenerateShoppingListProcessData;
    get processData(): GenerateShoppingListProcessData { return this._processData; }
    getSpaceToSaveTo(): Space {
        const spaceId = this._processData.spaceId;
        return this._notu.getSpace(spaceId);
    }

    async getScheduledMeals(): Promise<Array<Note>> {
        return this._notu.getNotes(
            `#[${this._food.meal.getFullName()}] AND #[${this._common.scheduled.getFullName()}]`
        );
    }

    getTagsToAdd(): Array<Tag> {
        return this.processData.tagIds.map(x => this._notu.getTag(x)).filter(x => !!x);
    }

    async save(shoppingList: Note) {
        await this._notu.saveNotes([shoppingList]);
    }
}


export function generateShoppingList(
    meals: Array<Note>,
    context: GenerateShoppingListProcessContext
): Note {

    const ingredientsMap = new Map<string, Array<string>>();

    for (const meal of meals) {
        const mealData = meal.getTagData(context.foodSpace.meal, MealData);
        for (const ingredient of mealData.ingredients) {
            let quantitiesArray = ingredientsMap.get(ingredient.name) ?? [];
            quantitiesArray.push(ingredient.quantity);
            ingredientsMap.set(ingredient.name, quantitiesArray);
        }
    }

    const checklist = new NoteChecklist([], null);
    for (const [ingredient, quantities] of ingredientsMap) {
        checklist.lines.push(new NoteChecklistLine([new NoteText(`${quantities.join(' + ')} x ${ingredient}`)], false));
    }
    const shoppingList = new Note(checklist.getText()).in(context.getSpaceToSaveTo());
    for (const tag of context.getTagsToAdd())
        shoppingList.addTag(tag);

    return shoppingList;
}