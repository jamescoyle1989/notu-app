import { NotuSelect } from "@/components/NotuSelect";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput } from "@/helpers/NotuStyles";
import { sortBy } from "es-toolkit";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Label, XStack, YStack } from "tamagui";
import { GenerateWorkoutProcessData } from "./GenerateWorkoutProcessNoteTagData";

export default class GenerateWorkoutProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} note={note} notu={notu} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new GenerateWorkoutProcessData(noteTag);
    }
}


function EditorComponent({ noteTag, note, notu }: NoteTagDataComponentProps) {
    const manualRefresh = useManualRefresh();
    const data = new GenerateWorkoutProcessData(noteTag);
    const spaces = sortBy(notu.cache.getSpaces(), [x => x.name]);
    const selectOptions = spaces.map(x => ({ name: x.name, value: x.id }));

    const labelWidth = 150;

    function onSaveExercisesToSpaceChange(newValue: number) {
        data.saveExercisesToSpaceId = newValue;
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
                    <Label width={labelWidth}>Name</Label>
                    <NotuInput value={data.name} flex={1}
                               onChangeText={onNameChange} />
                </XStack>
            )}

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Save Exercises To</Label>
                <NotuSelect options={selectOptions}
                            value={data.saveExercisesToSpaceId}
                            onValueChange={onSaveExercisesToSpaceChange} />
            </XStack>
        </YStack>
    );
}