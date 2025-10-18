import { NotuDateTimePicker } from "@/components/NotuDateTimePicker";
import { TimespanPicker } from "@/components/TimeSpanPicker";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { datetimeToText, dateToText, timespanToText } from "@/helpers/RenderHelpers";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Checkbox, CheckedState, Label, Paragraph, Popover, XStack, YStack } from "tamagui";
import { ScheduledData } from "./ScheduledNoteTagData";

export default class ScheduledNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

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
    const data = new ScheduledData(noteTag);

    function formatDate(date: Date): string {
        if (data.includeTime)
            return datetimeToText(date);
        return dateToText(date);
    }

    return (
        <Popover size="$5" allowFlip stayInFrame offset={15} resize placement="bottom">
            <Popover.Trigger asChild>
                <Paragraph textDecorationLine="underline">{formatDate(data.start)}</Paragraph>
            </Popover.Trigger>

            <Popover.Content elevate>
                <Popover.Arrow />
                <YStack>
                    <Paragraph>Duration: {timespanToText(data.durationMs)}</Paragraph>
                    <Paragraph>End: {formatDate(data.end)}</Paragraph>
                </YStack>
            </Popover.Content>
        </Popover>
    )
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new ScheduledData(noteTag);

    function onIncludeTimeChange(checked: CheckedState) {
        const value = checked.valueOf();
        if (typeof value === 'boolean') {
            data.includeTime = value;
            refreshCallback();
        }
    }

    function onStartChange(value: Date) {
        data.start = value;
        refreshCallback();
    }

    function onDurationChange(value: number) {
        data.durationMs = value;
        refreshCallback();
    }

    function onEndChange(value: Date) {
        data.end = value;
        refreshCallback();
    }

    return (
        <YStack>
            <XStack alignItems="center">
                <Label width={120}>Include Time</Label>
                <Checkbox checked={data.includeTime}
                          onCheckedChange={onIncludeTimeChange}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>
            <XStack alignItems="center">
                <Label width={120}>Start</Label>
                <NotuDateTimePicker value={data.start}
                                    onChange={onStartChange}
                                    hideTime={!data.includeTime} />
            </XStack>
            <XStack alignItems="center">
                <Label width={120}>Duration</Label>
                <TimespanPicker milliseconds={data.durationMs}
                                onChange={onDurationChange} />
            </XStack>
            <XStack alignItems="center">
                <Label width={120}>End</Label>
                <NotuDateTimePicker value={data.end}
                                    onChange={onEndChange}
                                    hideTime={!data.includeTime} />
            </XStack>
        </YStack>
    )
}