import { NoteActionsMenuBuilder } from '@/helpers/NoteAction';
import { NotuText } from '@/helpers/NotuStyles';
import { Note, Notu } from 'notu';
import React from 'react';

export class NoteText {
    private _displayText: string;
    get displayText(): string { return this._displayText; }
    set displayText(value: string) { this._displayText = value; }

    private _originalText: string;
    get originalText(): string { return this._originalText; }

    constructor(text: string) {
        this._originalText = text;
        this.displayText = text;
    }

    render() {
        if (this.displayText.length == 0)
            return;

        return (
            <NotuText>{this.displayText}</NotuText>
        )
    }

    renderForEdit(color: () => string) {
        return this.render();
    }

    getText(): string {
        return this.originalText;
    }

    get typeInfo(): string { return 'NoteText'; }

    get displaysInline(): boolean { return true; }

    get displaysInlineForEdit(): boolean { return true; }

    getThisPlusAllChildComponents(): Array<any> {
        return [this];
    }
        
    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
    }
}