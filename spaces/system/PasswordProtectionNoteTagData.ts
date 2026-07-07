import { SHA512 } from "crypto-es";
import { Note, NoteTag } from "notu";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export class PasswordProtectionData {
    private _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != defs.passwordProtection ||
            noteTag.tag.space.internalName != defs.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.passwordHash = this.passwordHash;
        this.passwordSalt = this.passwordSalt;
        this.cacheDurationMs = this.cacheDurationMs;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new PasswordProtectionData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): PasswordProtectionData {
        return new PasswordProtectionData(note.addTag(systemSpace.passwordProtection));
    }

    get passwordHash(): string { return this._nt.data.passwordHash; }
    set passwordHash(value: string) {
        value = value ?? '';
        if (this._nt.data.passwordHash != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.passwordHash = value;
    }

    get passwordSalt(): string { return this._nt.data.passwordSalt; }
    set passwordSalt(value: string) {
        value = value ?? this._generateSalt(20);
        if (this._nt.data.passwordSalt != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.passwordSalt = value;
    }

    calculateHash(password: string): string {
        return SHA512(password + this.passwordSalt).toString();
    }

    validatePassword(password: string): boolean {
        return this.calculateHash(password) == this.passwordHash;
    }

    private _generateSalt(length: number): string {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
        let output = '';
        while (output.length < length)
            output += chars[Math.floor(Math.random() * chars.length)];
        return output;
    }

    get cacheDurationMs(): number { return this._nt.data.cacheDurationMs; }
    set cacheDurationMs(value: number) {
        value = Math.max(0, value ?? 0);
        if (this._nt.data.cacheDurationMs != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.cacheDurationMs = value;
    }
}