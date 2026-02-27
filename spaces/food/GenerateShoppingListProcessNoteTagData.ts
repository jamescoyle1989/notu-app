import { UIAction } from "@/helpers/NoteAction";
import { areArraysDifferent } from "@/helpers/RenderHelpers";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "../system/ProcessNoteTagDataBaseClass";
import { FoodSpace } from "./FoodSpace";
import { FoodSpaceSetup } from "./FoodSpaceSetup";
import { GenerateShoppingListProcessContext } from "./GenerateShoppingListProcess";
import { showSelectMealsScreen } from "./GenerateShoppingListProcessUI";

export class GenerateShoppingListProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != FoodSpaceSetup.generateShoppingListProcess ||
            noteTag.tag.space.internalName != FoodSpaceSetup.internalName
        ) {
            throw Error(`Attempted to create a note tag data helper for a notetag that it does not support`);
        }
        super(noteTag);
        this.spaceId = this.spaceId;
        this.tagIds = this.tagIds;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new GenerateShoppingListProcessData(noteTag);
    }
    static addTag(note: Note, foodSpace: FoodSpace): GenerateShoppingListProcessData {
        return new GenerateShoppingListProcessData(note.addTag(foodSpace.generateShoppingListProcess));
    }

    get spaceId(): number { return this._nt.data.spaceId; }
    set spaceId(value: number) {
        value = value ?? 0;
        if (this._nt.data.spaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.spaceId = value;
    }

    get tagIds(): Array<number> { return this._nt.data.tagIds; }
    set tagIds(value: Array<number>) {
        value = value ?? [];
        if (areArraysDifferent(value, this._nt.data.tagIds) && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.tagIds = value;
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const context = new GenerateShoppingListProcessContext(this, notu);
        return await showSelectMealsScreen(context);
    }
}