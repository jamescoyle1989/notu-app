import { NotuDateTimePicker } from "@/components/NotuDateTimePicker";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { timespanToText } from "@/helpers/RenderHelpers";
import dayjs from "dayjs";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { View } from "tamagui";
import { DeadlineData } from "./DeadlineNoteTagData";
import { TasksSpaceSetup } from "./TasksSpaceSetup";

export default class DeadlineNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new DeadlineData(noteTag);

        function getDisplayText(): string {
            if (data.date < new Date())
                return 'OVERDUE!';
            return `Due in ${timespanToText(dayjs(data.date).diff(new Date(), 'milliseconds'))}`;
        }

        return (
            <View>
                <NotuText color={textColor} small>{getDisplayText()}</NotuText>
            </View>
        );
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new DeadlineData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == TasksSpaceSetup.internalName &&
            tag.name == TasksSpaceSetup.deadline;
    }
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new DeadlineData(noteTag);

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