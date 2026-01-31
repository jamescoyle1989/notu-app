import { NoteAction, NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import AccountNoteTagDataComponentFactory from "./AccountNoteTagDataComponent";
import BudgetCategoryNoteTagDataComponentFactory from "./BudgetCategoryNoteTagDataComponent";
import BudgetNoteTagDataComponentFactory from "./BudgetNoteTagDataComponent";
import CurrencyNoteTagDataComponentFactory from "./CurrencyNoteTagDataComponent";
import { ImportTransactionProcessContext, importTransactions } from "./ImportTransactionsProcess";
import { ImportTransactionsProcessData } from "./ImportTransactionsProcessNoteTagData";
import ImportTransactionsProcessNoteTagDataComponentFactory from "./ImportTransactionsProcessNoteTagDataComponent";
import { showProcessOutputScreen } from "./ImportTransactionsProcessUI";
import { MoneySpaceSetup } from "./MoneySpaceSetup";
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

    private _importTransactionsProcess: Tag;
    get importTransactionsProcess(): Tag { return this._importTransactionsProcess; }


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
        this._importTransactionsProcess = notu.getTagByName(MoneySpaceSetup.importTransactionsProcess, this._space);
    }


    async setup(notu: Notu): Promise<void> {
        await MoneySpaceSetup.setup(notu);
        this._load(notu);
    }


    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
        if (!!note.getTag(this.account)) {
            menuBuilder.addToTopOfEnd(
                new NoteAction('Import Account Statement',
                    async () => {
                        try {
                            const newNoteOptions = await importTransactions(note,
                                new ImportTransactionProcessContext(
                                    note.getTagData(this.importTransactionsProcess, ImportTransactionsProcessData),
                                    notu
                                )
                            );
                            return showProcessOutputScreen(note, newNoteOptions, notu);
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                )
            )
        }
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

        if (tag == this.importTransactionsProcess)
            return new ImportTransactionsProcessNoteTagDataComponentFactory();
        
        return null;
    }
}