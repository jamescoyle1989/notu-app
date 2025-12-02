import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Anchor, Button, Input, Label, Paragraph, XStack, YStack } from "tamagui";
import { convertAddressUrlToCoordinates } from "./AddressFetch";
import { AddressData } from "./AddressNoteTagData";

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
}


function BadgeComponent({
    noteTag
}: NoteTagDataComponentProps) {
    const data = new AddressData(noteTag);
    if (!!data.url) {
        return (<Anchor href={data.url} target="_blank">{data.name}</Anchor>);
    }
    return (<Paragraph>{data.name}</Paragraph>);
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
            const coords = await convertAddressUrlToCoordinates(data.url);
            if (coords != null) {
                data.coordinates = `${coords.latitude},${coords.longitude}`;
                refreshCallback();
            }
        }
        catch(err) {
            console.log(err);
        }
        const coords = convertAddressUrlToCoordinates(data.url);
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
                <Button onPress={getCoordinates}>Get Coordinates</Button>
            )}
            <XStack style={{alignItems: 'center'}}>
                <Label width={120}>Coordinates</Label>
                <Input value={data.coordinates ?? ''} onChangeText={onCoordsChange} />
            </XStack>
        </YStack>
    );
}