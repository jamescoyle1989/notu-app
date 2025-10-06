import { NumberInput } from "@/components/NumberInput";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode, useState } from "react";
import { Text, View } from "react-native";
import s from '../../helpers/NotuStyles';
import { DurationData } from "./DurationNoteTagData";

export default class DurationNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode {
        return (<BadgeComponent noteTag={noteTag} />);
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />)
    }
    
    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}


function formatDuration(data: DurationData) {
    const days = data.totalDays;
    const hours = data.hours;
    const minutes = data.minutes;

    if (days == 0)
        return `${hours}:${minutes.toString().padStart(2, '0')}`;

    let output = `${days}d`;
    if (hours > 0 || minutes > 0)
        output += ` ${hours}:${minutes.toString().padStart(2, '0')}`;
    return output;
}


function BadgeComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new DurationData(noteTag);
    return (
        <View style={s.margin.h3}>
            <Text style={s.text.plain}>{formatDuration(data)}</Text>
        </View>
    );
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new DurationData(noteTag);

    const [days, setDays] = useState(data.totalDays);
    const [hours, setHours] = useState(data.hours);
    const [minutes, setMinutes] = useState(data.minutes);

    function onDaysChange(value: number) {
        value = Math.max(0, Math.round(value));
        setDays(value);
        data.set(value, hours, minutes);
        refreshCallback();
    }

    function onHoursChange(value: number) {
        value = Math.min(23, Math.max(0, Math.round(value)));
        setHours(value);
        data.set(days, value, minutes);
        refreshCallback();
    }

    function onMinutesChange(value: number) {
        value = Math.min(59, Math.max(0, Math.round(value)));
        setMinutes(value);
        data.set(days, hours, value);
        refreshCallback();
    }

    return (
        <View>
            <Text style={s.text.plain}>Days:</Text>
            <NumberInput value={data.totalDays}
                         style={[s.text.plain, s.border.main]}
                         onChange={onDaysChange} />

            <Text style={s.text.plain}>Hours:</Text>
            <NumberInput value={data.hours}
                         style={[s.text.plain, s.border.main]}
                         onChange={onHoursChange} />

            <Text style={s.text.plain}>Minutes:</Text>
            <NumberInput value={data.minutes}
                         style={[s.text.plain, s.border.main]}
                         onChange={onMinutesChange} />
        </View>
    );
}