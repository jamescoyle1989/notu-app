import { NotuDateTimePicker } from "@/components/NotuDateTimePicker";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { datetimeToText } from "@/helpers/RenderHelpers";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { View } from "tamagui";
import { FinishedData } from "./FinishedNoteTagData";

export default class FinishedNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode {
        return (<BadgeComponent noteTag={noteTag} />);
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}


function BadgeComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new FinishedData(noteTag);
    return (
        <NotuText small>{datetimeToText(data.date)}</NotuText>
    );
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new FinishedData(noteTag);

    function onDateChange(value: Date): void {
        data.date = value;
        refreshCallback();
    }

    return (
        <View>
            <NotuDateTimePicker value={data.date} onChange={onDateChange} />
        </View>
    );
}