import { NotuText } from "@/helpers/NotuStyles";
import { NmlElement, Note, NoteTag } from "notu";
import { useState } from "react";
import defs from "../spaces/system/SystemSpaceDefs";

export class NoteSecret {
    private _cipherText: string;
    get cipherText(): string { return this._cipherText; }

    private _note: Note;
    get note(): Note { return this._note; }

    constructor(note: Note, cipherText: string) {
        this._cipherText = cipherText;
        this._note = note;
    }

    render() {
        return (
            <NotuText>[Secret]</NotuText>
        );
    }

    renderForEdit(color: () => string) {
        const [selectedColor, setSelectedColor] = useState(color());
        const myself = this;

        return (
            <NotuText bg={selectedColor as any}>{myself.cipherText}</NotuText>
        )
    }

    getText(): string {
        return `<Secret>${this.cipherText}</Secret>`;
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