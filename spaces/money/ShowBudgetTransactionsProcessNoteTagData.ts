import { ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import dayjs from "dayjs";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "../system/ProcessNoteTagDataBaseClass";
import { BudgetData } from "./BudgetNoteTagData";
import { groupTransactionsByPeriod } from "./BuildBudgetChartData";
import { MoneySpace } from "./MoneySpace";
import { MoneySpaceSetup } from "./MoneySpaceSetup";

export class ShowBudgetTransactionsProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != MoneySpaceSetup.showBudgetTransactionsProcess ||
            noteTag.tag.space.internalName != MoneySpaceSetup.internalName
        ) {
            throw Error(`Attempted to create a note tag data helper for a note tag that it does not support`);
        }
        super(noteTag);
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new ShowBudgetTransactionsProcessData(noteTag);
    }
    static addTag(note: Note, moneySpace: MoneySpace): ShowBudgetTransactionsProcessData {
        return new ShowBudgetTransactionsProcessData(note.addTag(moneySpace.showBudgetTransactionsProcess));
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const moneySpace = new MoneySpace(notu);
        const budgetData = note.getTagData(moneySpace.budget, BudgetData);
        if (!budgetData)
            throw new Error('The passed in note does not have a budget tag on it.');

        let query = `#${moneySpace.transaction.getFullName()}{.confirmed = 1}`;
        if (!!budgetData.transactionQuery)
            query += ` AND (${budgetData.transactionQuery})`;
        const groupedNotes = groupTransactionsByPeriod(budgetData, await notu.getNotes(query), moneySpace);
        const finalNotes = new Array<Note>();
        groupedNotes.forEach((notes, key) => {
            let groupHeading = '';
            if (budgetData.timeUnit == 'Days' || budgetData.timeUnit == 'Weeks')
                groupHeading = dayjs(key).format('YYYY MMM D');
            else if (budgetData.timeUnit == 'Months')
                groupHeading = dayjs(key).format('YYYY MMM');
            else if (budgetData.timeUnit == 'Years')
                groupHeading = dayjs(key).format('YYYY');
            for (const note of notes)
                note.group = groupHeading;
            finalNotes.push(...notes);
        });

        const action = new ShowNoteListAction(
            finalNotes,
            `Budget Transactions`
        );
        return action;
    }
}