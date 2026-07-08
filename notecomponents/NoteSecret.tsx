import { NotuText } from "@/helpers/NotuStyles";
import { getPasswordCache } from "@/helpers/PasswordCache";
import { AES, Utf8 } from "crypto-es";
import { NmlElement, Note, NoteTag } from "notu";
import { useState } from "react";
import defs from "../spaces/system/SystemSpaceDefs";

export class NoteSecret {
    private _text: string;
    get text(): string { return this._text; }

    private _note: Note;
    get note(): Note { return this._note; }

    constructor(note: Note, text: string) {
        this._text = text;
        this._note = note;
    }

    private _getPassword(): string {
        for (const nt of this.note.tags) {
            if (this._noteTagIsPasswordProtection(nt)) {
                const passwordCache = getPasswordCache();
                return passwordCache.get(nt.tag.id, this.note.id);
            }
        }
    }

    render() {
        const password = this._getPassword();
        if (!!password) {
            const plainText = AES.decrypt(this.text, password).toString(Utf8);
            return (
                <NotuText>{plainText}</NotuText>
            );
        }
        else {
            return (
                <NotuText>[Secret]</NotuText>
            );
        }
    }

    decrypt() {
        const password = this._getPassword();
        if (!password)
            throw new Error('Unable to retrieve password for decryption');
        this._text = AES.decrypt(this.text, password).toString(Utf8);
    }

    encrypt() {
        const password = this._getPassword();
        if (!password)
            throw new Error('Unable to retrieve password for encryption');
        this._text = AES.encrypt(this.text, password).toString();
    }

    renderForEdit(color: () => string) {
        const [selectedColor, setSelectedColor] = useState(color());
        const myself = this;

        return (
            <NotuText bg={selectedColor as any}>{myself.text}</NotuText>
        )
    }

    getText(): string {
        return `<Secret>${this.text}</Secret>`;
    }

    private _noteTagIsPasswordProtection(noteTag: NoteTag): boolean {
        for (const link of noteTag.tag.links) {
            if (
                link.name == defs.passwordProtection &&
                link.space.internalName == defs.internalName
            )
                return true;
        }
        return false;
    }

    get typeInfo(): string { return 'NoteSecret'; }

    get displaysInline(): boolean { return true; }

    get displaysInlineForEdit(): boolean { return true; }

    getThisPlusAllChildComponents(): Array<any> {
        return [this];
    }
}


export class NoteSecretProcessor {

    get displayName(): string { return 'Secret'; }

    get tagName(): string { return 'Secret'; }

    newComponentText(textContent: string): string {
        return `<Secret>${textContent}</Secret>`
    }

    create(
        data: NmlElement,
        note: Note,
        save: () => Promise<void>,
        childComponentFactory: (childElement: string | NmlElement) => any
    ): NoteSecret {
        if (data.children.length != 1 && typeof data.children[0] !== 'string')
            return new NoteSecret(note, '');
        return new NoteSecret(note, data.children[0] as string);
    }
}