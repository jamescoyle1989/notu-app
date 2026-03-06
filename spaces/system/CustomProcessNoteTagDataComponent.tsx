import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Label, XStack, YStack } from "tamagui";
import { CustomProcessData } from "./CustomProcessNoteTagData";

export default class CustomProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} note={note} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag): any {
        return new CustomProcessData(noteTag);
    }
}


function EditorComponent({ noteTag, note }: NoteTagDataComponentProps) {
    const data = new CustomProcessData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;

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
        </YStack>
    )
}