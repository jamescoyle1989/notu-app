import dayjs from 'dayjs';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from "expo-file-system";
import { Note, Notu, Space } from "notu";
import { CommonSpace } from '../common/CommonSpace';
import { AccountData } from './AccountNoteTagData';
import { CurrencyData } from './CurrencyNoteTagData';
import { ImportTransactionsProcessData } from './ImportTransactionsProcessNoteTagData';
import { MoneySpace } from './MoneySpace';
import { TransactionData } from './TransactionNoteTagData';

export class ImportTransactionProcessContext {
    private _notu: Notu;
    
    private _money: MoneySpace;
    get moneySpace(): MoneySpace { return this._money; }
    
    private _common: CommonSpace;
    get commonSpace(): CommonSpace { return this._common; }

    constructor(processData: ImportTransactionsProcessData, notu: Notu) {
        this._notu = notu;
        this._money = new MoneySpace(notu);
        this._common = new CommonSpace(notu);
        this._processData = processData;
    }

    async getAccountTransactions(account: Note): Promise<Array<Note>> {
        return await this._notu.getNotes(
            `#Transaction AND #[${account.ownTag.getFullName()}]`
        );
    }

    async getAccountCurrency(account: Note): Promise<Note> {
        const currencyTags = account.tags.filter(nt => nt.tag.linksTo(this._money.currency));
        if (currencyTags.length == 0)
            return null;
        if (currencyTags.length > 1)
            throw Error(`Accounts shouldn't be linked to more than one currency`);
        return (await this._notu.getNotes(
            `n.id = ${currencyTags[0].tag.id}`
        ))[0];
    }
    
    private _processData: ImportTransactionsProcessData;
    getSpaceToSaveTransactionsTo(): Space {
        const spaceId = this._processData.saveTransactionsToSpaceId;
        return this._notu.getSpace(spaceId);
    }
}



export class NewTransaction {
    note: Note;
    potentialDuplicates: Array<Note> = [];
}



export async function importTransactions(
    account: Note,
    context: ImportTransactionProcessContext
): Promise<Array<NewTransaction>> {
    const fileUri = await chooseImportFile();
    const fileData = await getFileContents(fileUri);
    const importer = await getImporterFromAccount(account, context);
    const newTransactions = await importer.import(fileData, context);
    return newTransactions;
}

async function chooseImportFile(): Promise<string> {
    const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
    });

    if (result.canceled)
        throw Error('Process cancelled');

    return result.assets[0].uri;
}

async function getFileContents(fileUri: string): Promise<string> {
    return await FileSystem.readAsStringAsync(fileUri, {});
}

function readCSVData(data: string, headerRowCount: number): Array<Array<string>> {
    const output: Array<Array<string>> = [];

    const lines = data.split('\n');
    for (let i = headerRowCount; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length == 0)
            continue;
        const lineData: Array<string> = [];

        //Need to handle the fact that some cells can be wrapped in quotes and contain commas
        const cells = line.split(',');
        let j = 0;
        while (j < cells.length) {
            const cellStart = j;
            let cellEnd = j;
            if (cells[cellStart].trim().startsWith('"')) {
                while (!cells[cellEnd].trim().endsWith('"'))
                    cellEnd++;
            }
            let cellText = cells.slice(cellStart, cellEnd + 1).join(',');
            if (cellText.trim().startsWith('"') && cellText.trim().endsWith('"')) {
                cellText = cellText.trim();
                cellText = cellText.substring(1, cellText.length - 1);
            }
            lineData.push(cellText);

            j = cellEnd + 1;
        }

        output.push(lineData);
    }

    return output;
}



async function filterOutDuplicateNewTransactions(
    newTransactions: Array<Note>,
    account: Note,
    context: ImportTransactionProcessContext
): Promise<Array<NewTransaction>> {
    const output: Array<NewTransaction> = [];
    const existingTransactions: Array<Note> = await context.getAccountTransactions(account);

    for (const newTxn of newTransactions) {
        const withDuplicates = findTransactionDuplicates(newTxn, existingTransactions, context.moneySpace);
        if (!!withDuplicates)
            output.push(withDuplicates);
    }
    return output;
}


function findTransactionDuplicates(newTxn: Note, existingTxns: Array<Note>, moneySpace: MoneySpace): NewTransaction {
    const output = new NewTransaction();
    output.note = newTxn;
    const newData = newTxn.getTagData(moneySpace.transaction, TransactionData);

    const potentialDuplicates = new Array<Note>();
    for (const oldTxn of existingTxns) {
        const oldData = oldTxn.getTagData(moneySpace.transaction, TransactionData);
        if (oldTxn.date.getTime() == newTxn.date.getTime() && oldData.accountCurrencyAmount == newData.accountCurrencyAmount) {
            if (oldData.description.trim().toUpperCase() == newData.description.trim().toUpperCase())
                return null;
            else
                potentialDuplicates.push(oldTxn);
        }
    }
    output.potentialDuplicates = potentialDuplicates;
    return output;
}



function throwInvalidCSVFormatError() {
    throw Error(
`Unexpected file import behavior format. CSV import should be something like:
"skip [number] | {date:[file date format]},{text},{amount:[optional negate flag]}"
You can also optionally replace amount with debit & credit flags, if they are split between separate columns.
Skip defines how many header lines to skip over, and after that you use commas and {date}/{text}/{amount}/{debit}/{credit} labels to define which columns we're pulling various data points out of.`);
}

export async function getImporterFromAccount(
    account: Note,
    context: ImportTransactionProcessContext
): Promise<TransactionImporter> {

    const accountData = account.getTagData(context.moneySpace.account, AccountData);
    if (!accountData)
        throw Error('The passed in note is note recognised as an account');
    const fileImportBehavior = accountData.fileImportMapping.trim();

    if (accountData.importType == 'CSV') {
        const importer = new CsvTransactionImporter();
        importer.account = account;
        importer.settlementDays = accountData.settlementDays;
        importer.currency = (await context.getAccountCurrency(account));
        const processInfo = /skip\s*(\d+)\s*\|\s*(.*)/.exec(fileImportBehavior);
        if (!processInfo)
            throwInvalidCSVFormatError();

        importer.skip = Number(processInfo[1]);
        let columnDefsText = processInfo[2];
        const columnsRegex = /^((?:,|\s)*)(?:{(\w+)(?:\s*:\s*(.+?))?})?(.*)$/;
        let columnIndex = 0;
        do {
            const regexResult = columnsRegex.exec(columnDefsText);
            if (!regexResult)
                throwInvalidCSVFormatError();
            columnIndex += regexResult[1].split(',').length - 1;
            const dataPoint = regexResult[2];
            const dataPointValue = (regexResult[3] ?? '').trim();
            if (!!dataPoint) {
                if (dataPoint == 'date') {
                    importer.dateColumn = columnIndex;
                    importer.dateFormat = dataPointValue;
                }
                else if (dataPoint == 'text')
                    importer.textColumn = columnIndex;
                else if (dataPoint == 'amount') {
                    importer.amountColumn = columnIndex;
                    const negateFlag = dataPointValue.toUpperCase();
                    if (negateFlag == 'NEGATE')
                        importer.negateAmount = true;
                    else if (!negateFlag)
                        importer.negateAmount = false;
                    else
                        throwInvalidCSVFormatError();
                }
                else if (dataPoint == 'debit')
                    importer.debitColumn = columnIndex;
                else if (dataPoint == 'credit')
                    importer.creditColumn = columnIndex;
            }
            columnDefsText = regexResult[4];
        } while(!!columnDefsText);
        if (importer.dateColumn == -1 || importer.textColumn == -1)
            throwInvalidCSVFormatError();
        if (importer.amountColumn == -1 && importer.debitColumn == -1 && importer.creditColumn == -1)
            throwInvalidCSVFormatError();
        if (importer.amountColumn >= 0 && importer.debitColumn >= 0 && importer.creditColumn >= 0)
            throwInvalidCSVFormatError();
        if ((importer.debitColumn == -1) != (importer.creditColumn == -1))
            throwInvalidCSVFormatError();
        return importer;
    }
    throw Error(`Unrecognised file import type: ${accountData.importType}`);
}



export interface TransactionImporter {
    import(data: string, context: ImportTransactionProcessContext): Promise<Array<NewTransaction>>
}

export class CsvTransactionImporter implements TransactionImporter {
    skip: number = 0;
    dateColumn: number = -1;
    dateFormat: string = 'yyyy-MM-dd';
    textColumn: number = -1;
    amountColumn: number = -1;
    negateAmount: boolean = false;
    debitColumn: number = -1;
    creditColumn: number = -1;
    account: Note = null;
    currency: Note = null;
    settlementDays: number = 0;

    async import(data: string, context: ImportTransactionProcessContext): Promise<Array<NewTransaction>> {
        const lines = readCSVData(data, this.skip);
        const output: Array<Note> = [];
        for (const line of lines) {
            let date = dayjs(line[this.dateColumn], this.dateFormat).startOf('day').add(12, 'hours');
            if (this.settlementDays > 0 && Math.abs(date.diff(new Date(), 'days')) < this.settlementDays)
                continue;

            const note = new Note(line[this.textColumn])
                .in(context.getSpaceToSaveTransactionsTo())
                .at(date.toDate());
            
            const transactionData = TransactionData.addTag(note, context.moneySpace);
            transactionData.effectiveStart = transactionData.effectiveEnd = date.toDate();
            transactionData.description = line[this.textColumn];
            note.addTag(this.account.ownTag);

            let amount = 0;
            if (this.debitColumn >= 0 && this.creditColumn >= 0) {
                if (line[this.debitColumn] != '')
                    amount = -Math.abs(this._parseAmount(line[this.debitColumn]));
                else
                    amount = Math.abs(this._parseAmount(line[this.creditColumn]));
            }
            else
                amount = this._parseAmount(line[this.amountColumn]) * (this.negateAmount ? -1 : 1);

            transactionData.baseCurrencyAmount = transactionData.accountCurrencyAmount = amount;
            if (!!this.currency) {
                const currencyData = this.currency.getTagData(context.moneySpace.currency, CurrencyData);
                if (!currencyData.isBase)
                    transactionData.baseCurrencyAmount = Math.round(amount * currencyData.baseExchangeRate * 100) / 100;
            }
            output.push(note);
        }
        return await filterOutDuplicateNewTransactions(output, this.account, context);
    }

    private _parseAmount(value: string) {
        return Number(value.replaceAll(',', ''));
    }
}