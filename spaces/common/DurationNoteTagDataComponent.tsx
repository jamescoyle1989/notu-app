import { TimespanPicker } from "@/components/TimeSpanPicker";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { timespanToText } from "@/helpers/RenderHelpers";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Paragraph } from "tamagui";
import { DurationData } from "./DurationNoteTagData";

export default class DurationNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

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
    const data = new DurationData(noteTag);
    return (
        <Paragraph>{timespanToText(data.ms)}</Paragraph>
    );
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new DurationData(noteTag);

    function onMsChange(value: number) {
        data.ms = value;
        refreshCallback();
    }

    return (
        <TimespanPicker milliseconds={data.ms}
                        onChange={onMsChange} />
    );
}