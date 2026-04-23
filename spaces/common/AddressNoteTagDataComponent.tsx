import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuButton, NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { Linking } from "react-native";
import { Input, Label, XStack, YStack } from "tamagui";
import { convertAddressUrlToCoordinates } from "./AddressFetch";
import { AddressData } from "./AddressNoteTagData";
import { CommonSpaceSetup } from "./CommonSpaceSetup";

export default class AddressNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(
        noteTag: NoteTag,
        note: Note,
        notu: Notu
    ): ReactNode {
        return (<BadgeComponent noteTag={noteTag} />);
    }

    getEditorComponent(
        noteTag: NoteTag,
        note: Note,
        notu: Notu,
        refreshCallback: () => void
    ): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />);
    }

    validate(
        noteTag: NoteTag,
        note: Note,
        notu: Notu
    ): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new AddressData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == CommonSpaceSetup.internalName &&
            tag.name == CommonSpaceSetup.address;
    }
}


function BadgeComponent({
    noteTag
}: NoteTagDataComponentProps) {
    const data = new AddressData(noteTag);

    function onPress() {
        if (!!data.url)
            Linking.openURL(data.url);
    }

    return (<NotuText small onPress={onPress}>{data.name}</NotuText>);
}


function EditorComponent({
    noteTag,
    refreshCallback
}: NoteTagDataComponentProps) {
    const data = new AddressData(noteTag);

    function onNameChange(value: string) {
        data.name = value;
        refreshCallback();
    }

    function onURLChange(value: string) {
        data.url = value;
        refreshCallback();
    }

    function onCoordsChange(value: string) {
        data.coordinates = value;
        refreshCallback();
    }

    async function getCoordinates() {
        try {
            console.log(data.name, data.url);
            const coords = await convertAddressUrlToCoordinates(data.url);
            console.log(coords);
            if (coords != null) {
                data.coordinates = `${coords.latitude},${coords.longitude}`;
                refreshCallback();
            }
        }
        catch(err) {
            console.log(err);
        }
    }

    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={120}>Name</Label>
                <Input value={data.name} onChangeText={onNameChange} />
            </XStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={120}>URL</Label>
                <Input value={data.url ?? ''} onChangeText={onURLChange} />
            </XStack>
            {!!data.url && !data.coordinates && (
                <NotuButton onPress={getCoordinates} theme="highlight">Get Coordinates</NotuButton>
            )}
            <XStack style={{alignItems: 'center'}}>
                <Label width={120}>Coordinates</Label>
                <Input value={data.coordinates ?? ''} onChangeText={onCoordsChange} />
            </XStack>
        </YStack>
    );
}