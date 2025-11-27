import { NoteActionsMenuBuilder } from '@/helpers/NoteAction';
import { NotuInput, NotuText } from '@/helpers/NotuStyles';
import { NmlElement, Note, Notu } from 'notu';
import React, { useState } from 'react';
import { Linking } from 'react-native';
import { Dialog, View } from 'tamagui';
import { NoteComponentContainer } from '../components/NoteComponentContainer';
import { useManualRefresh } from '../helpers/Hooks';
import { NoteText } from './NoteText';

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

    renderForEdit(color: () => string) {
        const [showLinkEditor, setShowLinkEditor] = useState(false);
        const manualRefresh = useManualRefresh();
        const [selectedColor, setSelectedColor] = useState(color());
        const myself = this;

        function handleURLChange(newValue: string): void {
            myself._url = newValue;
            manualRefresh();
        }

        function canEditContent(): boolean {
            return myself.content.length == 0 ||
                (myself.content.length == 1 && myself.content[0].typeInfo == 'NoteText');
        }

        function getContentValue(): string {
            if (!canEditContent())
                return '';
            if (myself.content.length == 0)
                return '';
            return myself.content[0].displayText;
        }

        function handleContentChange(newValue: string): void {
            if (newValue.length == 0 && myself.content.length == 1) {
                myself.content.pop();
                manualRefresh();
                return;
            }
            if (myself.content.length == 0)
                myself.content.push(new NoteText(newValue));
            else
                myself.content[0] = new NoteText(newValue);
            manualRefresh();
        }

        return (
            <NotuText>
                <NotuText bg={selectedColor as any}>
                    <NotuText bold> Link: </NotuText>
                    <NotuText pressable onPress={() => setShowLinkEditor(true)}>Edit</NotuText>
                    <NotuText> </NotuText>
                    {this.content.map((x, index) => (
                        <NoteComponentContainer key={index} component={x} editMode={true} color={color}/>
                    ))}
                    <NotuText> </NotuText>
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
                                               onChangeText={handleURLChange} />
                                    {canEditContent() && (
                                        <View>
                                            <NotuText>Content</NotuText>
                                            <NotuInput value={getContentValue()}
                                                       onChangeText={handleContentChange} />
                                        </View>
                                    )}
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
    
    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
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