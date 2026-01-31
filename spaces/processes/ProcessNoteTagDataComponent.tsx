import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput, NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Label, XStack } from "tamagui";
import { ProcessData } from "./ProcessNoteTagData";

export default class ProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new ProcessData(noteTag);
        if (!data.name)
            return null;
        return (<NotuText small color={textColor}>{data.name}</NotuText>);
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new ProcessData(noteTag);
    const labelWidth = 120;

    function handleNameChange(value: string) {
        data.name = value;
        refreshCallback();
    }

    return (
        <XStack style={{alignItems: 'center'}}>
            <Label width={labelWidth}>Name</Label>
            <NotuInput value={data.name} flex={1}
                       onChangeText={handleNameChange} />
        </XStack>
    );
}