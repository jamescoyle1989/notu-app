import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput, NotuText } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Checkbox, CheckedState, Label, XStack, YStack } from "tamagui";
import { PageData } from "./PageNoteTagData";

export default class PageNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new PageData(noteTag);
        if (!data.name)
            return null;
        return (<NotuText small color={textColor}>{data.name}</NotuText>)
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />)
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new PageData(noteTag);
    }
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new PageData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;

    function handleNameChange(value: string) {
        data.name = value;
        refreshCallback();
    }

    function handleGroupChange(value: string) {
        data.group = value;
        manualRefresh();
    }

    function handleOrderChange(value: number) {
        data.order = value;
        manualRefresh();
    }

    function handleQueryChange(value: string) {
        data.query = value;
        manualRefresh();
    }

    function handleSearchAllSpacesChange(checked: CheckedState) {
        data.searchAllSpaces = (checked.valueOf() == true);
        manualRefresh();
    }

    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Name</Label>
                <NotuInput value={data.name} flex={1}
                           onChangeText={handleNameChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Group</Label>
                <NotuInput value={data.group} flex={1}
                           onChangeText={handleGroupChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Order</Label>
                <NumberInput numberValue={data.order} flex={1}
                             onNumberChange={handleOrderChange} />
            </XStack>

            <Label width={labelWidth}>Query</Label>
            <NotuInput value={data.query}
                       multiline={true}
                       onChangeText={handleQueryChange} />

            <XStack style={{alignItems: 'center'}}>
                <Label marginInlineEnd={3}>Search All Spaces</Label>
                <Checkbox checked={data.searchAllSpaces} onCheckedChange={handleSearchAllSpacesChange}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>
        </YStack>
    )
}