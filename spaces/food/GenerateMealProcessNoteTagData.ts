import { UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "../system/ProcessNoteTagDataBaseClass";
import { FoodSpace } from "./FoodSpace";
import { FoodSpaceSetup } from "./FoodSpaceSetup";
import { showCustomiseMealScreen } from "./GenerateMealProcessUI";

export class GenerateMealProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != FoodSpaceSetup.generateMealProcess ||
            noteTag.tag.space.internalName != FoodSpaceSetup.internalName
        ) {
            throw Error(`Attempted to create a note tag data helper for a notetag that it does not support`);
        }
        super(noteTag);
        this.saveMealToSpaceId = this.saveMealToSpaceId;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new GenerateMealProcessData(noteTag);
    }
    static addTag(note: Note, foodSpace: FoodSpace): GenerateMealProcessData {
        return new GenerateMealProcessData(note.addTag(foodSpace.generateMealProcess));
    }

    get saveMealToSpaceId(): number { return this._nt.data.saveMealToSpaceId; }
    set saveMealToSpaceId(value: number) {
        if (this._nt.data.saveMealToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveMealToSpaceId = value;
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        return Promise.resolve(showCustomiseMealScreen(note, notu, this));
    }
}