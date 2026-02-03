import { NotuDateTimePicker } from "@/components/NotuDateTimePicker";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { datetimeToText } from "@/helpers/RenderHelpers";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { View } from "tamagui";
import { StartedData } from "./StartedNoteTagData";

export default class StartedNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode {
        return (<BadgeComponent noteTag={noteTag} />);
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new StartedData(noteTag);
    }
}


function BadgeComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new StartedData(noteTag);
    return (
        <View>
            <NotuText>{datetimeToText(data.date)}</NotuText>
        </View>
    );
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new StartedData(noteTag);

    function onDateChange(value: Date): void {
        data.date = value;
        refreshCallback();
    }

    return (
        <View>
            <NotuText>Date:</NotuText>
            <NotuDateTimePicker value={data.date} onChange={onDateChange} />
        </View>
    );
}