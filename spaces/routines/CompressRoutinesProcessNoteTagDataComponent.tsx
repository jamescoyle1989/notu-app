import { NotuSelect } from "@/components/NotuSelect";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput } from "@/helpers/NotuStyles";
import { sortBy } from "es-toolkit";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Label, XStack, YStack } from "tamagui";
import { CompressRoutinesProcessData } from "./CompressRoutinesProcessNoteTagData";

export default class CompressRoutinesProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} note={note} notu={notu} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new CompressRoutinesProcessData(noteTag);
    }
}


function EditorComponent({ noteTag, note, notu }: NoteTagDataComponentProps) {
    const manualRefresh = useManualRefresh();
    const data = new CompressRoutinesProcessData(noteTag);
    const spaces = sortBy(notu.cache.getSpaces(), [x => x.name]);
    const selectOptions = spaces.map(x => ({ name: x.name, value: x.id }));

    function onSaveEventsToSpaceChange(newValue: number) {
        data.saveNotesToSpaceId = newValue;
        manualRefresh();
    }

    function onNameChange(newValue: string) {
        data.name = newValue;
        manualRefresh();
    }

    return (
        <YStack>
            {data.requiresName(note) && (
                <XStack style={{alignItems: 'center'}}>
                    <Label width={150}>Name</Label>
                    <NotuInput value={data.name} flex={1}
                               onChangeText={onNameChange} />
                </XStack>
            )}

            <XStack style={{alignItems: 'center'}}>
                <Label width={150}>Save Notes To</Label>
                <NotuSelect options={selectOptions}
                            value={data.saveNotesToSpaceId}
                            onValueChange={onSaveEventsToSpaceChange} />
            </XStack>
        </YStack>
    )
}