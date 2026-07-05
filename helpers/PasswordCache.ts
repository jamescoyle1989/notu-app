import { PasswordProtectionData } from "@/spaces/system/PasswordProtectionNoteTagData";
import dayjs from "dayjs";
import { DateProvider } from "./DateProvider";

let _passwordCache: PasswordCache;

export function getPasswordCache(forceClear: boolean = false): PasswordCache {
    if (!_passwordCache || forceClear)
        _passwordCache = new PasswordCache(new DateProvider());
    return _passwordCache;
}

export class PasswordCache {
    private _fullCache: Map<number, Map<number | null, PasswordCacheEntry>> = new Map<number, Map<number | null, PasswordCacheEntry>>();

    private _dateProvider: DateProvider;

    constructor(dateProvider: DateProvider) {
        this._dateProvider = dateProvider;
    }
    
    add(password: string, passwordTagId: number, passwordNoteTagData: PasswordProtectionData, noteId: number | null) {
        if (!this._fullCache.has(passwordTagId))
            this._fullCache.set(passwordTagId, new Map<number | null, PasswordCacheEntry>());

        const passwordCache = this._fullCache.get(passwordTagId);
        const newExpiryDate = dayjs(this._dateProvider.now()).add(passwordNoteTagData.cacheDurationMs, 'milliseconds').toDate();
        passwordCache.set(noteId, new PasswordCacheEntry(password, newExpiryDate));
        
        this._forgetExpiredPasswords();
    }

    get(passwordTagId: number, noteId: number): string | null {
        const passwordCache = this._fullCache.get(passwordTagId);
        if (!passwordCache)
            return null;

        const now = this._dateProvider.now().getTime();

        const noteObj = passwordCache.get(noteId);
        if (!!noteObj) {
            if (noteObj.expiryDate <= now) {
                passwordCache.delete(noteId);
                return null;
            }
            return noteObj.password;
        }

        const nullObj = passwordCache.get(null);
        if (!!nullObj) {
            if (nullObj.expiryDate <= now) {
                passwordCache.delete(null);
                return null;
            }
            return nullObj.password;
        }

        return null;
    }

    forget(passwordTagId: number, noteId: number | null) {
        if (noteId == null) {
            this._fullCache.delete(passwordTagId);
            return;
        }

        const passwordCache = this._fullCache.get(passwordTagId);
        if (!passwordCache)
            return;

        passwordCache.delete(noteId);
    }

    private _forgetExpiredPasswords(): void {
        const now = this._dateProvider.now().getTime();
        for (const passwordId of this._fullCache.keys()) {
            const passwordCache = this._fullCache.get(passwordId);
            for (const noteId of [...passwordCache.keys()]) {
                const entry = passwordCache.get(noteId);
                if (entry.expiryDate <= now)
                    passwordCache.delete(noteId);
            }
        }
    }
}


export class PasswordCacheEntry {
    private _password: string;
    get password(): string { return this._password; }

    private _expiryDate: number;
    get expiryDate(): number { return this._expiryDate; }

    constructor(password: string, expiryDate: Date) {
        this._password = password;
        this._expiryDate = expiryDate.getTime();
    }
}