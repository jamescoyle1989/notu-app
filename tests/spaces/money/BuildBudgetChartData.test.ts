import dayjs from "dayjs";
import { Note, Notu, NotuCache } from "notu";
import { expect, test } from "vitest";
import { BudgetData } from "../../../spaces/money/BudgetNoteTagData";
import { groupTransactionsByPeriod, splitTransactionIntoPeriodDayCounts, splitTransactionNoteIntoPeriodClones } from "../../../spaces/money/BuildBudgetChartData";
import { MoneySpace } from "../../../spaces/money/MoneySpace";
import { MoneySpaceSetup } from "../../../spaces/money/MoneySpaceSetup";
import { TransactionCategoryData } from "../../../spaces/money/TransactionCategoryData";
import { TransactionData } from "../../../spaces/money/TransactionNoteTagData";
import FakeNotuCacheFetcher from "../../testhelpers/FakeNotuCache";
import { FakeNotuClient } from "../../testhelpers/FakeNotuClient";

async function notuSetup(): Promise<Notu> {
    const cacheFetcher = new FakeNotuCacheFetcher();
    cacheFetcher.spacesData = [
        { id: 1, name: 'Money', internalName: MoneySpaceSetup.internalName }
    ];
    cacheFetcher.tagsData = [
        { id: 1, spaceId: 1, name: MoneySpaceSetup.transaction, links: [] },
        { id: 2, spaceId: 1, name: MoneySpaceSetup.budget, links: [] },
        { id: 3, spaceId: 1, name: MoneySpaceSetup.budgetCategory, links: [] },
        { id: 4, spaceId: 1, name: 'Category1', links: [3] },
        { id: 5, spaceId: 1, name: 'Category2', links: [3] }
    ];

    const notu = new Notu(
        new FakeNotuClient(),
        new NotuCache(cacheFetcher)
    );
    await notu.cache.populate();
    return notu;
}


test('splitTransactionIntoPeriodDayCounts works for daily budgets', async () => {
    // Arrange
    const notu = await notuSetup();
    const moneySpace = new MoneySpace(notu);

    const budgetNote = new Note().in(moneySpace.space);
    const budgetData = BudgetData.addTag(budgetNote, moneySpace);
    budgetData.timeUnit = 'Days';
    
    const transactionNote = new Note().in(moneySpace.space);
    const transactionData = TransactionData.addTag(transactionNote, moneySpace);
    transactionData.effectiveStart = dayjs('2026-07-26 20:52:00').toDate();
    transactionData.effectiveEnd = dayjs('2026-07-29 10:34:00').toDate();

    // Act
    const dayCounts = splitTransactionIntoPeriodDayCounts(transactionData, budgetData);

    // Assert
    expect(dayCounts.size).toBe(4);
    expect(dayCounts.get(dayjs('2026-07-26 12:00').toDate().getTime())).toBe(1);
    expect(dayCounts.get(dayjs('2026-07-27 12:00').toDate().getTime())).toBe(1);
    expect(dayCounts.get(dayjs('2026-07-28 12:00').toDate().getTime())).toBe(1);
    expect(dayCounts.get(dayjs('2026-07-29 12:00').toDate().getTime())).toBe(1);
});


test('splitTransactionIntoPeriodDayCounts works for weekly budgets', async () => {
    // Arrange
    const notu = await notuSetup();
    const moneySpace = new MoneySpace(notu);

    const budgetNote = new Note().in(moneySpace.space);
    const budgetData = BudgetData.addTag(budgetNote, moneySpace);
    budgetData.timeUnit = 'Weeks';
    
    const transactionNote = new Note().in(moneySpace.space);
    const transactionData = TransactionData.addTag(transactionNote, moneySpace);
    transactionData.effectiveStart = dayjs('2026-07-25 20:52:00').toDate();
    transactionData.effectiveEnd = dayjs('2026-08-04 10:34:00').toDate();

    // Act
    const dayCounts = splitTransactionIntoPeriodDayCounts(transactionData, budgetData);

    // Assert
    expect(dayCounts.size).toBe(3);
    expect(dayCounts.get(dayjs('2026-07-20 12:00').toDate().getTime())).toBe(2);
    expect(dayCounts.get(dayjs('2026-07-27 12:00').toDate().getTime())).toBe(7);
    expect(dayCounts.get(dayjs('2026-08-03 12:00').toDate().getTime())).toBe(2);
});


test('splitTransactionIntoPeriodDayCounts works for monthly budgets', async () => {
    // Arrange
    const notu = await notuSetup();
    const moneySpace = new MoneySpace(notu);

    const budgetNote = new Note().in(moneySpace.space);
    const budgetData = BudgetData.addTag(budgetNote, moneySpace);
    budgetData.timeUnit = 'Months';
    
    const transactionNote = new Note().in(moneySpace.space);
    const transactionData = TransactionData.addTag(transactionNote, moneySpace);
    transactionData.effectiveStart = dayjs('2026-07-25 20:52:00').toDate();
    transactionData.effectiveEnd = dayjs('2026-08-04 10:34:00').toDate();

    // Act
    const dayCounts = splitTransactionIntoPeriodDayCounts(transactionData, budgetData);

    // Assert
    expect(dayCounts.size).toBe(2);
    expect(dayCounts.get(dayjs('2026-07-01 12:00').toDate().getTime())).toBe(7);
    expect(dayCounts.get(dayjs('2026-08-01 12:00').toDate().getTime())).toBe(4);
});


test('splitTransactionIntoPeriodDayCounts works for annual budgets', async () => {
    // Arrange
    const notu = await notuSetup();
    const moneySpace = new MoneySpace(notu);

    const budgetNote = new Note().in(moneySpace.space);
    const budgetData = BudgetData.addTag(budgetNote, moneySpace);
    budgetData.timeUnit = 'Years';
    
    const transactionNote = new Note().in(moneySpace.space);
    const transactionData = TransactionData.addTag(transactionNote, moneySpace);
    transactionData.effectiveStart = dayjs('2026-12-20 20:52:00').toDate();
    transactionData.effectiveEnd = dayjs('2028-01-11 10:34:00').toDate();

    // Act
    const dayCounts = splitTransactionIntoPeriodDayCounts(transactionData, budgetData);

    // Assert
    expect(dayCounts.size).toBe(3);
    expect(dayCounts.get(dayjs('2026-01-01 12:00').toDate().getTime())).toBe(12);
    expect(dayCounts.get(dayjs('2027-01-01 12:00').toDate().getTime())).toBe(365);
    expect(dayCounts.get(dayjs('2028-01-01 12:00').toDate().getTime())).toBe(11);
});



test('splitTransactionNoteIntoPeriodClones does correct division', async () => {
    // Arrange
    const notu = await notuSetup();
    const moneySpace = new MoneySpace(notu);
    
    const transactionNote = new Note().in(moneySpace.space);
    const transactionData = TransactionData.addTag(transactionNote, moneySpace);
    transactionData.effectiveStart = dayjs('2026-07-29 20:52:00').toDate();
    transactionData.effectiveEnd = dayjs('2026-08-02 10:34:00').toDate();
    transactionData.baseCurrencyAmount = 100;
    transactionData.accountCurrencyAmount = 400;

    const category1Data = TransactionCategoryData.addTag(
        transactionNote,
        notu.getTagByName('Category1', moneySpace.space)
    );
    category1Data.value = 50;

    const periodCounts = new Map<number, number>();
    periodCounts.set(dayjs('2026-07-01 12:00:00').toDate().getTime(), 3);
    periodCounts.set(dayjs('2026-08-01 12:00:00').toDate().getTime(), 2);

    // Act
    const clones = splitTransactionNoteIntoPeriodClones(
        transactionNote,
        periodCounts,
        moneySpace
    );

    // Assert
    expect(clones).toHaveLength(2);

    const period1 = TransactionData.new(clones[0].getTag(moneySpace.transaction));
    expect(period1.effectiveStart.getTime()).toBe(dayjs('2026-07-01 12:00:00').toDate().getTime());
    expect(period1.baseCurrencyAmount).toBe(60);
    expect(period1.accountCurrencyAmount).toBe(240);
    expect(TransactionCategoryData.new(clones[0].getTag(notu.getTagByName('Category1', moneySpace.space))).value).toBe(30);

    const period2 = TransactionData.new(clones[1].getTag(moneySpace.transaction));
    expect(period2.effectiveStart.getTime()).toBe(dayjs('2026-08-01 12:00:00').toDate().getTime());
    expect(period2.baseCurrencyAmount).toBe(40);
    expect(period2.accountCurrencyAmount).toBe(160);
    expect(TransactionCategoryData.new(clones[1].getTag(notu.getTagByName('Category1', moneySpace.space))).value).toBe(20);
});



test('groupTransactionsByPeriod returns correct result', async () => {
    // Arrange
    const notu = await notuSetup();
    const moneySpace = new MoneySpace(notu);

    const budgetNote = new Note().in(moneySpace.space);
    const budgetData = BudgetData.addTag(budgetNote, moneySpace);
    budgetData.timeUnit = 'Months';
    
    const transactionNote1 = new Note().in(moneySpace.space);
    const transactionData1 = TransactionData.addTag(transactionNote1, moneySpace);
    transactionData1.effectiveStart = dayjs('2026-07-29 20:52:00').toDate();
    transactionData1.effectiveEnd = dayjs('2026-08-02 10:34:00').toDate();
    transactionData1.baseCurrencyAmount = 100;
    transactionData1.accountCurrencyAmount = 100;
    
    const transactionNote2 = new Note().in(moneySpace.space);
    const transactionData2 = TransactionData.addTag(transactionNote2, moneySpace);
    transactionData2.effectiveStart = dayjs('2026-08-01 20:52:00').toDate();
    transactionData2.effectiveEnd = dayjs('2026-08-05 10:34:00').toDate();
    transactionData2.baseCurrencyAmount = 200;
    transactionData2.accountCurrencyAmount = 200;

    // Act
    const result = groupTransactionsByPeriod(
        budgetData,
        [transactionNote1, transactionNote2],
        moneySpace
    );

    // Assert
    expect(result.size).toBe(2);

    const july = result.get(dayjs('2026-07-01 12:00:00').toDate().getTime());
    expect(july).toHaveLength(1);
    expect(new TransactionData(july[0].getTag(moneySpace.transaction)).accountCurrencyAmount).toBe(60);

    const august = result.get(dayjs('2026-08-01 12:00:00').toDate().getTime());
    expect(august).toHaveLength(2);
    expect(new TransactionData(august[0].getTag(moneySpace.transaction)).accountCurrencyAmount).toBe(40);
    expect(new TransactionData(august[1].getTag(moneySpace.transaction)).accountCurrencyAmount).toBe(200);
});