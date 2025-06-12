import { Note, NoteComponentInfo } from 'notu';
import React from 'react';
import { Text } from "react-native";
import appStyles from '../helpers/AppStyles';

export class NoteText {
    private _displayText: string;
    get displayText(): string { return this._displayText; }
    set displayText(value: string) { this._displayText = value; }

    private _originalText: string;
    get originalText(): string { return this._originalText; }

    constructor(displayText: string, originalText: string) {
        this._displayText = displayText;
        this._originalText = originalText;
    }

    render() {
        if (this._displayText.length == 0)
            return;

        return (
            <Text style={appStyles.whiteText}>{this._displayText}</Text>
        )
    }

    getText(): string {
        return this._originalText;
    }

    getTypeInfo(): string {
        return 'NoteText';
    }
}


export class NoteTextProcessor {

    get displayName(): string { return null; }

    newComponentText(textContent: string): string {
        return textContent;
    }

    get componentShowsInlineInParagraph(): boolean { return true; }

    identify(text: string): NoteComponentInfo {
        const start = text.indexOf('<Text>');
        if (start < 0)
            return null;

        let end = text.indexOf('</Text>', start + 1);
        if (end < 0)
            return null;
        end += '</Text>'.length;

        const componentText = text.substring(start, end);
        return new NoteComponentInfo(componentText, start, this);
    }

    create(info: NoteComponentInfo, note: Note, save: () => Promise<void>): NoteText {
        let displayText = info.text.replace('<Text>', '').replace('</Text>', '');
        return new NoteText(displayText, info.text);
    }
}


export class DefaultTextProcessor {

    get displayName(): string { return null; }

    newComponentText(textContent: string): string {
        return textContent;
    }

    get componentShowsInlineInParagraph(): boolean { return true; }

    identify(text: string): NoteComponentInfo {
        return new NoteComponentInfo(text, 0, this);
    }

    create(info: NoteComponentInfo, note: Note, save: () => Promise<void>): NoteText {
        return new NoteText(info.text, info.text);
    }
}