import { Overlay } from '@rneui/base';
import { NmlElement, Note } from 'notu';
import React, { useState } from 'react';
import { Linking, Text, TextInput, View } from 'react-native';
import { NoteComponentContainer } from '../components/NoteComponentContainer';
import { useManualRefresh } from '../helpers/Hooks';
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

    renderForEdit() {
        const [showLinkEditor, setShowLinkEditor] = useState(false);
        const manualRefresh = useManualRefresh();
        const myself = this;

        function handleTextChange(newValue: string): void {
            myself._url = newValue;
            manualRefresh();
        }

        return (
            <Text>
                <Text style={[s.touch.danger, s.text.plain]}>
                    <Text style={[s.text.bold, s.text.link]} onPress={() => setShowLinkEditor(true)}>Link: </Text>
                    {this.content.map((x, index) => (
                        <NoteComponentContainer key={index} component={x} editMode={true}/>
                    ))}
                </Text>

                <View>
                    <Overlay isVisible={showLinkEditor}
                             onBackdropPress={() => setShowLinkEditor(false)}>
                        <Text style={[s.text.plain]}>URL</Text>
                        <TextInput value={this.url}
                                   onChangeText={handleTextChange}
                                   style={[s.border.main, s.text.plain]}/>
                    </Overlay>
                </View>
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
        return `<Link url="${this.url}">${this.content.map(x => x.getText()).join('')}</Link>`
    }

    get typeInfo(): string { return 'NoteLink'; }

    get displaysInline(): boolean { return true; }
}


export class NoteLinkProcessor {

    get displayName(): string { return 'Link'; }

    get tagName(): string { return 'Link'; }

    newComponentText(textContent: string): string {
        return `<Link url="">${textContent}</Link>`;
    }

    create(
        data: NmlElement,
        note: Note,
        save: () => Promise<void>,
        childComponentFactory: (childElement: string | NmlElement) => any
    ): NoteLink {
        return new NoteLink(
            data.attributes?.url ?? '',
            data.children.map(x => childComponentFactory(x))
        );
    }
}