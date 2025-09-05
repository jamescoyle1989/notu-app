import { Note, NoteComponentInfo } from 'notu';
import React from 'react';
import { Linking, Text } from 'react-native';
import s from '../helpers/NotuStyles';

export class NoteLink {
    private _url: string;
    get url(): string { return this._url; }

    private _content: string;
    get content(): string { return this._content; }

    constructor(url: string, content: string) {
        this._url = url;
        this._content = content;
    }

    render() {
        return (
            <Text style={[s.text.link]} onPress={() => this.openURL()}>{this.content}</Text>
        );
    }

    getText(): string {
        return `<Link url="${this.url}">${this.content}</Link>`
    }

    getTypeInfo(): string {
        return 'NoteLink';
    }

    openURL(): void {
        let url = this.url;
        if (url.startsWith('www.'))
            url = 'https://' + url;
        Linking.openURL(url);
    }
}


export class NoteLinkProcessor {

    get displayName(): string { return 'Link'; }

    newComponentText(textContent: string): string {
        return `<Link url="">${textContent}</Link>`;
    }

    get componentShowsInlineInParagraph(): boolean { return true; }

    identify(text: string): NoteComponentInfo {
        const start = text.indexOf('<Link ');
        if (start < 0)
            return null;

        let end = text.indexOf('</Link>', start + 1);
        if (end < 0)
            return null;
        end += '</Link>'.length;

        const componentText = text.substring(start, end);
        return new NoteComponentInfo(componentText, start, this);
    }

    create(info: NoteComponentInfo, note: Note, save: () => Promise<void>): NoteLink {
        const regexResult = /<Link url="(.*)">(.*)<\/Link>/.exec(info.text);
        if (!regexResult)
            throw Error(`Invalid Link: ${info.text}`);
        return new NoteLink(regexResult[1], regexResult[2]);
    }
}