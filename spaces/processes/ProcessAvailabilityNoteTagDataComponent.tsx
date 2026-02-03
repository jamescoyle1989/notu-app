import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Label, XStack } from "tamagui";
import { ProcessAvailabilityData } from "./ProcessAvailabilityNoteTagData";

export default class ProcessAvailabilityNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new ProcessAvailabilityData(noteTag);
    }
}


function EditorComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new ProcessAvailabilityData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;

    function handleQueryChange(value: string) {
        data.query = value;
        manualRefresh();
    }

    return (
        <XStack style={{alignItems: 'center'}}>
            <Label width={labelWidth}>Query</Label>
            <NotuInput value={data.query} flex={1}
                       onChangeText={handleQueryChange} />
        </XStack>
    );
}