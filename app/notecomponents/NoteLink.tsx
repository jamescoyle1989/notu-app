import { Note, NoteXmlElement } from 'notu';
import React from 'react';
import { Linking, Text } from 'react-native';
import { NoteComponentContainer } from '../components/NoteComponentContainer';
import s from '../helpers/NotuStyles';

export class NoteLink {
    private _url: string;
    get url(): string { return this._url; }

    private _content: Array<any>;
    get content(): Array<any> { return this._content; }

    constructor(url: string, content: Array<any>) {
        this._url = url;
        this._content = content;
    }

    render() {
        return (
            <Text style={[s.text.link]} onPress={() => this.openURL()}>
                {this.content.map((x, index) => (
                    <NoteComponentContainer key={index} component={x}/>
                ))}
            </Text>
        );
    }

    openURL(): void {
        let url = this.url;
        if (url.startsWith('www.'))
            url = 'https://' + url;
        Linking.openURL(url);
    }

    getText(): string {
        return `<|Link url="${this.url}"|>${this.content.map(x => x.getText()).join('')}<|/Link|>`
    }

    get typeInfo(): string { return 'NoteLink'; }

    get displaysInline(): boolean { return true; }
}


export class NoteLinkProcessor {

    get displayName(): string { return 'Link'; }

    get tagName(): string { return 'Link'; }

    newComponentText(textContent: string): string {
        return `<|Link url=""|>${textContent}<|/Link|>`;
    }

    create(
        data: NoteXmlElement,
        note: Note,
        save: () => Promise<void>,
        childComponentFactory: (childElement: NoteXmlElement) => any
    ): NoteLink {
        return new NoteLink(
            data.attributes?.url ?? '',
            data.children.map(x => childComponentFactory(x))
        );
    }
}