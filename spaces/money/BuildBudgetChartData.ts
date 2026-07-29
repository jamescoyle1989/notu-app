import dayjs from "dayjs";
import { sum } from "es-toolkit";
import { Note } from "notu";
import { BudgetData } from "./BudgetNoteTagData";
import { MoneySpace } from "./MoneySpace";
import { TransactionCategoryData } from "./TransactionCategoryData";
import { TransactionData } from "./TransactionNoteTagData";


export class BudgetChartData {
    points: Array<BudgetChartPoint>;
    min?: number;
    max?: number;
    target?: number;
}

export class BudgetChartPoint {
    date: string;
    value: number;
    movingAverage?: number;

    toObject(): any {
        const output = {
            date: this.date,
            value: this.value
        };
        if (this.movingAverage != undefined)
            output['movingAverage'] = this.movingAverage;
        return output;
    }
}


export function BuildBudgetChartData(
    budgetNote: Note,
    transactionNotes: Array<Note>,
    moneySpace: MoneySpace
): BudgetChartData {
    const budgetData = budgetNote.getTagData(moneySpace.budget, BudgetData);
    const transactionsByPeriod = groupTransactionsByPeriod(
        budgetData,
        transactionNotes,
        moneySpace
    );
    const reportValues = buildPerPeriodReportValues(
        budgetNote,
        transactionsByPeriod,
        new Date(),
        moneySpace
    );
    return buildBudgetChartDataFromReportValues(
        budgetData,
        reportValues
    );
}


export function buildBudgetChartDataFromReportValues(
    budgetData: BudgetData,
    reportValues: Map<number, number>
): BudgetChartData {
    const output = new BudgetChartData();
    if (budgetData.minAmount != null)
        output.min = budgetData.minAmount;
    if (budgetData.maxAmount != null)
        output.max = budgetData.maxAmount;
    if (budgetData.targetAmount != null)
        output.target = budgetData.targetAmount;
    output.points = [];

    if (reportValues.size == 0)
        return output;

    const keys = Array.from(reportValues.keys()).sort((a, b) => a - b);
    const endDate = keys[keys.length - 1];
    let date = keys[0];

    let movingAverageBuffer = null;
    if (budgetData.movingAveragePeriods > 0) {
        let firstValue = reportValues.get(date) ?? 0;
        if (budgetData.flipGraphDirection)
            firstValue = -firstValue;
        movingAverageBuffer = new Array(budgetData.movingAveragePeriods).fill(firstValue);
    }
    let bufferIndex = 0;

    while (date <= endDate) {
        const point = new BudgetChartPoint();
        point.value = reportValues.get(date) ?? 0;
        if (budgetData.flipGraphDirection)
            point.value = -point.value;
        if (!!movingAverageBuffer) {
            movingAverageBuffer[bufferIndex] = point.value;
            bufferIndex = (bufferIndex + 1) % movingAverageBuffer.length;
            point.movingAverage = sum(movingAverageBuffer) / movingAverageBuffer.length;
        }
        if (budgetData.timeUnit == 'Days') {
            point.date = dayjs(date).format('D MMM');
            date = dayjs(date).add(1, 'day').startOf('day').add(12, 'hours').toDate().getTime();
        }
        else if (budgetData.timeUnit == 'Weeks') {
            point.date = dayjs(date).format('D MMM');
            date = dayjs(date).add(7, 'days').startOf('day').add(12, 'hours').toDate().getTime();
        }
        else if (budgetData.timeUnit == 'Months') {
            point.date = dayjs(date).format('MMM');
            date = dayjs(date).add(1, 'month').startOf('day').add(12, 'hours').toDate().getTime();
        }
        else if (budgetData.timeUnit == 'Years') {
            point.date = dayjs(date).format('YYYY');
            date = dayjs(date).add(1, 'year').startOf('day').add(12,  'hours').toDate().getTime();
        }
        output.points.push(point);
    }

    return output;
}


export function buildPerPeriodReportValues(
    budgetNote: Note,
    perPeriodTransactions: Map<number, Array<Note>>,
    periodCutoffDate: Date,
    moneySpace: MoneySpace
): Map<number, number> {
    const output = new Map<number, number>();
    const periodCutoffTime = periodCutoffDate.getTime();
    const categories = budgetNote.tags.map(x => x.tag).filter(x => x.linksTo(moneySpace.budgetCategory));

    perPeriodTransactions.forEach((notes, key) => {
        if (key > periodCutoffTime)
            return;
        let sum = 0;
        for (const note of notes) {
            if (categories.length == 0)
                sum += note.getTagData(moneySpace.transaction, TransactionData).baseCurrencyAmount;
            else {
                for (const nt of note.tags) {
                    if (categories.find(x => nt.tag.id == x.id)) {
                        const categoryData = new TransactionCategoryData(nt);
                        sum += categoryData.value;
                    }
                }
            }
        }
        if (sum != 0)
            output.set(key, sum);
    });

    return output;
}


export function groupTransactionsByPeriod(
    budgetData: BudgetData,
    transactionNotes: Array<Note>,
    moneySpace: MoneySpace
): Map<number, Array<Note>> {
    const output = new Map<number, Array<Note>>();

    for (const note of transactionNotes) {
        const periodDayCounts = splitTransactionIntoPeriodDayCounts(
            note.getTagData(moneySpace.transaction, TransactionData),
            budgetData
        );
        const periodBasedNotes = splitTransactionNoteIntoPeriodClones(
            note,
            periodDayCounts,
            moneySpace
        );
        for (const periodNote of periodBasedNotes) {
            const transData = periodNote.getTagData(moneySpace.transaction, TransactionData);
            const key = transData.effectiveStart.getTime();
            if (output.has(key))
                output.get(key).push(periodNote);
            else
                output.set(key, [periodNote]);
        }
    }

    return output;
}


//Split up a transaction based on its effective dates so that you have a breakdown of which budget periods it falls into
//For example, for a weekly budget you may have a transaction that spans Fri+Sat+Sun of one week, and then also Mon+Tue of the next
//For a monthly budget you may have a transaction that goes from 27th-31st of month A, and 1st-12th of month B
export function splitTransactionIntoPeriodDayCounts(
    transaction: TransactionData,
    budgetData: BudgetData
): Map<number, number> {
    const output = new Map<number, number>();

    let end = dayjs(transaction.effectiveEnd).startOf('day').add(12, 'hours').toDate().getTime();
    let day = dayjs(transaction.effectiveStart).startOf('day').add(12, 'hours');
    while (day.toDate().getTime() <= end) {
        let periodKey = day;
        if (budgetData.timeUnit == 'Weeks') {
            if (day.day() > 1)
                periodKey = day.subtract(day.day() - 1, 'days');
            else if (day.day() == 0)
                periodKey = day.subtract(6, 'days');
        }
        else if (budgetData.timeUnit == 'Months')
            periodKey = day.startOf('month');
        else if (budgetData.timeUnit == 'Years')
            periodKey = day.startOf('year');
        periodKey = periodKey.startOf('day').add(12, 'hours');

        const key = periodKey.toDate().getTime();
        if (output.has(key))
            output.set(key, output.get(key) + 1);
        else
            output.set(key, 1);

        day = day.add(1, 'day');
    }

    return output;
}


export function splitTransactionNoteIntoPeriodClones(
    transactionNote: Note,
    periodDayCounts: Map<number, number>,
    moneySpace: MoneySpace
): Array<Note> {
    const output = new Array<Note>();

    let totalCount = 0;
    periodDayCounts.forEach(v => totalCount += v);

    periodDayCounts.forEach((count, key) => {
        const periodNote = transactionNote.duplicate();
        const periodTransData = periodNote.getTagData(moneySpace.transaction, TransactionData);
        periodTransData.effectiveStart = new Date(key);
        periodTransData.effectiveEnd = new Date(key);
        periodTransData.baseCurrencyAmount *= count / totalCount;
        periodTransData.accountCurrencyAmount *= count / totalCount;
        for (const categoryTag of periodNote.tags.filter(x => x.tag.linksTo(moneySpace.budgetCategory))) {
            const periodCategoryData = new TransactionCategoryData(categoryTag);
            periodCategoryData.value *= count / totalCount;
        }
        output.push(periodNote);
    });

    return output;
}