import { NotuDateTimePicker } from "@/components/NotuDateTimePicker";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { datetimeToText } from "@/helpers/RenderHelpers";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Text, View } from "react-native";
import s from '../../helpers/NotuStyles';
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
}


function BadgeComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new StartedData(noteTag);
    return (
        <View style={s.margin.h3}>
            <Text style={s.text.plain}>{datetimeToText(data.date)}</Text>
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
            <Text style={s.text.plain}>Date:</Text>
            <NotuDateTimePicker value={data.date} onChange={onDateChange} />
        </View>
    );
}