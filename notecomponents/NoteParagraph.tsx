import { NoteActionsMenuBuilder } from '@/helpers/NoteAction';
import { NotuText } from '@/helpers/NotuStyles';
import { Note, Notu } from 'notu';
import React from 'react';
import { NoteText } from './NoteText';

export class NoteParagraph {
    private _children: Array<any>;
    get children(): Array<any> { return this._children; }

    constructor(children: Array<any>) {
        this._children = children;
        if (children.length == 0)
            return;
        if (children[0] instanceof NoteText) {
            const firstText = children[0] as NoteText;
            firstText.displayText = firstText.displayText.trimStart();
        }
        if (children[children.length - 1] instanceof NoteText) {
            const lastText = children[children.length - 1] as NoteText;
            lastText.displayText = lastText.displayText.trimEnd();
        }
    }

    render() {
        return (
            <NotuText>
                {this._children.map((x, index) => (
                    <NotuText key={index}>{(x as any).render()}</NotuText>
                ))}
            </NotuText>
        );
    }

    renderForEdit() {
        return (
            <NotuText>
                {this._children.map((x, index) => (
                    <NotuText key={index}>{(x as any).renderForEdit()}</NotuText>
                ))}
            </NotuText>
        );
    }

    getText(): string {
        return this._children.map(x => x.getText()).join('');
    }

    get typeInfo(): string { return 'NoteParagraph'; }

    get displaysInline(): boolean { return false; }

    get displaysInlineForEdit(): boolean { return false; }

    getThisPlusAllChildComponents(): Array<any> {
        const output = [this];
        for (const child of this.children) {
            output.push(...child.getThisPlusAllChildComponents());
        }
        return output;
    }
        
    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
    }
}