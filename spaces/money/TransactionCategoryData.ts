import { Note, NoteTag, Tag } from 'notu';
import { MoneySpaceSetup } from './MoneySpaceSetup';

export class TransactionCategoryData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            !noteTag.tag.links.find(x => 
                x.name == MoneySpaceSetup.budgetCategory &&
                x.space.internalName == MoneySpaceSetup.internalName
            )
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.value = this.value;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new TransactionCategoryData(noteTag);
    }
    static addTag(note: Note, budgetCategory: Tag): TransactionCategoryData {
        return new TransactionCategoryData(note.addTag(budgetCategory));
    }

    get value(): number { return this._nt.data.value; }
    set value(val: number) {
        val = val ?? 0;
        if (this._nt.data.value != val && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.value = val;
    }
}