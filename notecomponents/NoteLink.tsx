import { NotuInput, NotuText } from '@/helpers/NotuStyles';
import { NmlElement, Note } from 'notu';
import React, { useState } from 'react';
import { Linking } from 'react-native';
import { Dialog, View } from 'tamagui';
import { NoteComponentContainer } from '../components/NoteComponentContainer';
import { useManualRefresh } from '../helpers/Hooks';

export class NoteLink {
    private _url: string;
    get url(): string { return this._url; }

    private _content: Array<any>;
    get content(): Array<any> { return this._content; }

    constructor(url: string, content: Array<any>) {
        this._url = url.replaceAll('\\"', '"');
        this._content = content;
    }

    render() {
        return (
            <NotuText pressable onPress={() => this.openURL()}>
                {this.content.map((x, index) => (
                    <NoteComponentContainer key={index} component={x}/>
                ))}
            </NotuText>
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
            <NotuText>
                <NotuText danger>
                    <NotuText bold pressable onPress={() => setShowLinkEditor(true)}>Link: </NotuText>
                    {this.content.map((x, index) => (
                        <NoteComponentContainer key={index} component={x} editMode={true}/>
                    ))}
                </NotuText>

                <View>
                    <Dialog modal open={showLinkEditor}>
                        <Dialog.Portal>
                            <Dialog.Overlay key="notelinkeditoroverlay" onPress={() => setShowLinkEditor(false)} />
                            <Dialog.FocusScope>
                                <Dialog.Content bordered elevate
                                                width="80%"
                                                key="notelinkeditorcontent">
                                    <NotuText>URL</NotuText>
                                    <NotuInput value={this.url}
                                               onChangeText={handleTextChange} />
                                </Dialog.Content>
                            </Dialog.FocusScope>
                        </Dialog.Portal>
                    </Dialog>
                </View>
            </NotuText>
        );
    }

    openURL(): void {
        let url = this.url;
        if (url.startsWith('www.'))
            url = 'https://' + url;
        Linking.openURL(url);
    }

    getText(): string {
        return `<Link url="${this.url.replaceAll('"', '\\"')}">${this.content.map(x => x.getText()).join('')}</Link>`
    }

    get typeInfo(): string { return 'NoteLink'; }

    get displaysInline(): boolean { return true; }

    get displaysInlineForEdit(): boolean { return true; }

    getThisPlusAllChildComponents(): Array<any> {
        const output = [this];
        for (const cnt of this.content) {
            output.push(...cnt.getThisPlusAllChildComponents());
        }
        return output;
    }
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