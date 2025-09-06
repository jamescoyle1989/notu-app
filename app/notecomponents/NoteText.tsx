import React from 'react';
import { Text } from "react-native";

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
            <Text>{this.displayText}</Text>
        )
    }

    getText(): string {
        return this.originalText;
    }

    get typeInfo(): string { return 'NoteText'; }

    get displaysInline(): boolean { return true; }
}