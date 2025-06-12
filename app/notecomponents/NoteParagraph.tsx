import { NoteComponent } from 'notu/dist/types/notecomponents/NoteComponent';
import React from 'react';
import { Text } from "react-native";
import { NoteText } from './NoteText';

export class NoteParagraph {
    private _children: Array<NoteComponent>;
    get children(): Array<NoteComponent> { return this._children; }

    constructor(children: Array<NoteComponent>) {
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
            <Text>
                {this._children.map((x, index) => (
                    <Text key={index}>{(x as any).render()}</Text>
                ))}
            </Text>
        )
    }

    getText(): string {
        return this._children.map(x => x.getText()).join('');
    }

    getTypeInfo(): string {
        return 'NoteParagraph';
    }
}