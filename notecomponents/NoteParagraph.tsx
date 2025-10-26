import React from 'react';
import { Text } from "react-native";
import s from '../helpers/NotuStyles';
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
            <Text style={s.text.plain}>
                {this._children.map((x, index) => (
                    <Text key={index}>{(x as any).render()}</Text>
                ))}
            </Text>
        );
    }

    renderForEdit() {
        return (
            <Text style={[s.text.plain]}>
                {this._children.map((x, index) => (
                    <Text key={index}>{(x as any).renderForEdit()}</Text>
                ))}
            </Text>
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
}