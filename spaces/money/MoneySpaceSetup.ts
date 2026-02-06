import { Note, Notu, Space } from "notu";
import { ProcessesSpace } from "../processes/ProcessesSpace";

export class MoneySpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.money'; }
    static get currency(): string { return 'Currency'; }
    static get account(): string { return 'Account'; }
    static get budgetCategory(): string { return 'Budget Category'; }
    static get budget(): string { return 'Budget'; }
    static get transaction(): string { return 'Transaction'; }
    static get importTransactionsProcess(): string { return 'Import Transactions'; }

    static async setup(notu: Notu): Promise<void> {
        let moneySpace = notu.getSpaceByInternalName(this.internalName);
        if (!moneySpace) {
            moneySpace = new Space('Money').v('1.0.0');
            moneySpace.internalName = this.internalName;
            await notu.saveSpace(moneySpace);

            const currency = new Note(`Adding this tag to a note marks it as representing a financial currency. The first currency that you add will automatically be set up as your base currency, this is the currency which will be used throughout the system for all calculations. Every other currency that you add will prompt you for an exchange rate to the base currency. If you do have multiple bank accounts in separate currencies then it's recommended before importing transactions from those accounts to quickly check and update what the exchange rate is for those foreign currencies so that your transactions get imported with a fairly up-to-date representation of what their value is in your base currency.`)
                .in(moneySpace).setOwnTag(this.currency);
            currency.ownTag.asInternal();

            const account = new Note(
`The Account tag marks a note as representing a source of transactions. In most cases this would be a bank account, but it can sometimes be helpful to have an account representing your cash transactions as well. When you set up an account, you are also prompted to set up its file import type. 'Manual' means that you would need to key in all transactions that have happened yourself. 'CSV' means that you can pass in a .csv file of transactions, which the system will compare to the transactions you have already logged, and automatically identify all new transactions. All you need to do to add transactions then is just go to your online banking, download a CSV extract of your accounts (almost all banks offer this), and import them into notu.

To help the system in identifying transactions, you will need to provide a bit of information about how to read the information from the CSV, this is where the File Import Mapping field comes in. With this, you define the file format that you're importing. An example would be:

skip 0 | {date: dd/MM/yyyy}, , {text}, {amount: negate}

The first part here says that we don't skip reading any of the top lines. This could be useful if the top line has headers in it. After the pipe separator, we then get to defining our columns. What we see above is that we want to pull the date from the 1st column, there's some info in the 2nd column that we don't care about, we want to pull the text from the 3rd column, and we want to pull the amount from the 4th column. In the date column, we also have some formatting information to let the system know how our bank is representing dates. In the amount column, we've also added the optional 'negate' flag, which tells the system to negate whatever amount it fetches. This is often necessary for credit card accounts where things that you bought are shown as positives.

On some accounts, there isn't a single column for amounts, but instead separate columns for debits and credits. In these cases, you can replace the {amount} marker with {debit}, {credit}.`
            )
                .in(moneySpace).setOwnTag(this.account);
            account.ownTag.asInternal();

            const budgetCategory = new Note(`The Category tag marks a note as being some way of categorising transactions. For example, you may set up a Bills category, which you then add to all your bill payment transactions. When adding a category to a transaction, you can choose how much of that transaction amount goes to the category. For example, you may have separate budget categories for Eating Out & Going Out Drinking. When having a meal with friends that gets a bit boozy you could then split the transaction from the restaurant into food and drink portions.`)
                .in(moneySpace).setOwnTag(this.budgetCategory);
            budgetCategory.ownTag.asInternal();

            const budget = new Note(
`The Budget tag marks a note as representing some financial goal. This is where you can start using the system to provide real insights into how you're using your money. The Budget tag has a number of fields which it allows you to configure when added to a note. The most important one is the Transaction Query, this allows you to select which transactions you want the budget to look at. Say for example you want to track how much money you're spending on going out, you might set your query to: #[Eating Out] AND #Drinks AND #Entertainment

Once you've got your budget pulling in the transactions that you care about, you then want to specify what time period it's measuring transactions against, this can be set to Days, Weeks, Months or Years. If you want, you can also add a simple moving average which will help show a smoothed out representation of the data, allowing you to more easily see trends.

The rest of the fields help with how the budget data can be displayed in graph. If all of the transactions that you're measuring are negative values, you may find that your spending graph looks upside-down. The 'Flip Direction' field is helpful for sorting this out. Then you have the Min, Max & Target Amount fields, these will add overlays to the graph to highlight where you have said that you want your spending to be. And finally, the Max Days History field allows you to specify how far back the graph will go when displaying results.`)
                .in(moneySpace).setOwnTag(this.budget);
            budget.ownTag.asInternal();

            const transaction = new Note(
`The Transaction tag marks a note as representing some financial transaction on one of your accounts. The transaction has several fields which get auto-filled during import, including currency amount (how much you paid/received in the currency of the account), base amount (how much you paid/received in the base currency of the system), effective start & end (when the transaction happened. These can be different if, for example, you paid an annual subscription and want to spread the cost out over that entire period). There's also the description field which will always be left empty for you to add any helpful reminders about what the transaction was.

Transactions also allow you to add categories to them. Each category that you add to a transaction can be modified to set what portion of the transaction goes into that category. For example, if you had an Eating Out category and also a Drinks category, when you went out for an expensive meal with friends and ordered a few drinks which you were there, you might decide to put 80% of the transaction value on Eating Out, and 20% on Drinks.`
            )
                .in(moneySpace).setOwnTag(this.transaction);
            transaction.ownTag.asInternal();

            await notu.saveNotes([
                currency,
                account,
                budgetCategory,
                budget,
                transaction
            ]);

            const processesSpace = new ProcessesSpace(notu);

            const importTransactionsProcess = new Note(`This process will allow you to select a file for the selected account and import transactions from it. The process will automatically detect transactions that have already been imported. If it finds any which appear similar, though slightly different to ones already imported, then it will flag them for your attention.`)
                .in(moneySpace).setOwnTag(this.importTransactionsProcess);
            importTransactionsProcess.ownTag.asInternal();
            importTransactionsProcess.addTag(processesSpace.process);
            await notu.saveNotes([importTransactionsProcess]);
        }
    }
}