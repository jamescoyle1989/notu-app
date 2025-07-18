import * as ExpoSQLite from 'expo-sqlite';


export class RunResult {
    changes: number;
    lastInsertRowId: number | bigint;

    constructor(changes: number, lastInsertRowId: number | bigint) {
        this.changes = changes;
        this.lastInsertRowId = lastInsertRowId;
    }
}


export interface ISQLiteConnection {
    run(command: string, ...args: Array<any>): Promise<RunResult>;

    getFirst(query: string, ...args: Array<any>): Promise<any>;

    getAll(query: string, ...args: Array<any>): Promise<Array<any>>;

    close(): Promise<void>;
}


/**
 * Provides thin wrapper around ExpoSQLite.SQLiteDatabase
 */
export class ExpoSQLiteConnection implements ISQLiteConnection {
    private _internal: ExpoSQLite.SQLiteDatabase;

    constructor(db: ExpoSQLite.SQLiteDatabase) {
        this._internal = db;
        console.log('constructor');
        this._internal.execSync('PRAGMA journal_mode = WAL');
    }

    async run(command: string, ...args: Array<any>): Promise<RunResult> {
        console.log(`run: ${command}`)
        const result = await this._internal.runAsync(command, ...args);
        return new RunResult(result.changes, result.lastInsertRowId);
    }

    async getFirst(query: string, ...args: Array<any>): Promise<any> {
        console.log(`getFirst: ${query}`)
        return await this._internal.getFirstAsync(query, ...args);
    }

    async getAll(query: string, ...args: Array<any>): Promise<any> {
        console.log(`getAll: ${query}`);
        return await this._internal.getAllAsync(query, ...args);
    }

    async close(): Promise<void> {
        console.log(`close`);
        //await this._internal.closeAsync();
    }
}