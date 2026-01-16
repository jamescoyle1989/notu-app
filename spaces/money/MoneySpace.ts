import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { CommonSpaceSetup } from "../common/CommonSpaceSetup";
import { LogicalSpace } from "../LogicalSpace";
import AccountNoteTagDataComponentFactory from "./AccountNoteTagDataComponent";
import BudgetCategoryNoteTagDataComponentFactory from "./BudgetCategoryNoteTagDataComponent";
import BudgetNoteTagDataComponentFactory from "./BudgetNoteTagDataComponent";
import CurrencyNoteTagDataComponentFactory from "./CurrencyNoteTagDataComponent";
import ImportTransactionsProcessNoteTagDataComponentFactory from "./ImportTransactionsProcessNoteTagDataComponent";
import { MoneySpaceSetup } from "./MoneySpaceSetup";
import TransactionCategoryNoteTagDataComponentFactory from "./TransactionCategoryNoteTagDataComponent";
import TransactionNoteTagDataComponentFactory from "./TransactionNoteTagDataComponent";

export class MoneySpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _currency: Tag;
    get currency(): Tag { return this._currency; }

    private _account: Tag;
    get account(): Tag { return this._account; }

    private _budgetCategory: Tag;
    get budgetCategory(): Tag { return this._budgetCategory; }

    private _budget: Tag;
    get budget(): Tag { return this._budget; }

    private _transaction: Tag;
    get transaction(): Tag { return this._transaction; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(MoneySpaceSetup.internalName);
        this._currency = notu.getTagByName(MoneySpaceSetup.currency, this._space);
        this._account = notu.getTagByName(MoneySpaceSetup.account, this._space);
        this._budgetCategory = notu.getTagByName(MoneySpaceSetup.budgetCategory, this._space);
        this._budget = notu.getTagByName(MoneySpaceSetup.budget, this._space);
        this._transaction = notu.getTagByName(MoneySpaceSetup.transaction, this._space);
    }


    async setup(notu: Notu): Promise<void> {
        await MoneySpaceSetup.setup(notu);
        this._load(notu);
    }


    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
    }


    resolveNoteTagDataComponentFactory(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        if (tag == this.currency)
            return new CurrencyNoteTagDataComponentFactory();

        if (tag == this.account)
            return new AccountNoteTagDataComponentFactory();

        if (tag == this.budgetCategory)
            return new BudgetCategoryNoteTagDataComponentFactory();

        if (tag == this.budget)
            return new BudgetNoteTagDataComponentFactory();

        if (tag == this.transaction)
            return new TransactionNoteTagDataComponentFactory();

        if (
            tag.linksTo(this.budgetCategory) &&
            !!note.tags.find(x => x.tag.id == this.transaction.id)
        ) {
            return new TransactionCategoryNoteTagDataComponentFactory();
        }

        if (
            tag.space.internalName == CommonSpaceSetup.internalName &&
            tag.name == CommonSpaceSetup.process &&
            note.ownTag?.isInternal &&
            note.ownTag?.name == MoneySpaceSetup.importTransactionsProcess
        )
            return new ImportTransactionsProcessNoteTagDataComponentFactory();
        
        return null;
    }
}