import { NotuDateTimePicker } from "@/components/NotuDateTimePicker";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { dateToText } from "@/helpers/RenderHelpers";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode, useEffect, useState } from "react";
import { Checkbox, CheckedState, Label, View, XStack, YStack } from "tamagui";
import { CommonSpace } from "../common/CommonSpace";
import { RecurringData } from "../common/RecurringNoteTagData";
import { PersonCelebrationData } from "./PersonCelebrationNoteTagData";

export default class PersonCelebrationNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(
        noteTag: NoteTag,
        note: Note,
        notu: Notu
    ): ReactNode {
        if (!!noteTag?.data?.date) {
            const data = new PersonCelebrationData(noteTag);
            return (
                <View>
                    <NotuText>{dateToText(data.date)}</NotuText>
                </View>
            )
        }
    }
    
    getEditorComponent(
        noteTag: NoteTag,
        note: Note,
        notu: Notu,
        refreshCallback: () => void
    ): ReactNode {
        return (<EditorComponent noteTag={noteTag} notu={notu} refreshCallback={refreshCallback} />);
    }

    validate(
        noteTag: NoteTag,
        note: Note,
        notu: Notu
    ): Promise<boolean> {
        return Promise.resolve(true);
    }
}


function EditorComponent({ noteTag, notu, refreshCallback }: NoteTagDataComponentProps) {
    const manualRefresh = useManualRefresh();
    const data = new PersonCelebrationData(noteTag);
    const [isLoading, setIsLoading] = useState(true);
    const [recurringData, setRecurringData] = useState<RecurringData>(null);

    useEffect(() => {
        setIsLoading(true);
        const fetchCelebrationData = async () => {
            const celebrationNote = (await notu.getNotes(
                `n.id = ${noteTag.tag.id}`,
                noteTag.tag.space.id
            ))[0];
            const commonSpace = new CommonSpace(notu);
            const recurringNT = celebrationNote.getTag(commonSpace.recurring);
            const recurring = !!recurringNT ? new RecurringData(recurringNT) : null;
            if (!recurring && data.date == null)
                data.date = new Date();
            else if (!!recurring && data.date != null)
                data.date = null;
            setRecurringData(recurring);
            setIsLoading(false);
        };
        fetchCelebrationData();
    }, [noteTag]);

    if (isLoading)
        return;

    function onDateChange(date: Date) {
        data.date = date;
        refreshCallback();
    }

    function onPlanDaysAheadCheckedChnage(checkState: CheckedState) {
        if (checkState.valueOf() == true)
            data.planDaysAhead = 0;
        else if (checkState.valueOf() == false)
            data.planDaysAhead = null;
        manualRefresh();
    }

    function onPlanDaysAheadValueChange(value: number) {
        data.planDaysAhead = value;
        manualRefresh();
    }
    
    const labelWidth = 120;

    return (
        <YStack>
            {!recurringData && (
                <XStack style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>Date</Label>
                    <NotuDateTimePicker value={data.date}
                                        onChange={onDateChange}
                                        hideTime={true} />
                </XStack>
            )}
            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Plan Days Ahead</Label>

                <Checkbox checked={data.planDaysAhead != null}
                          onCheckedChange={onPlanDaysAheadCheckedChnage}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>

                {data.planDaysAhead != null && (
                    <NumberInput value={data.planDaysAhead}
                                 onChange={onPlanDaysAheadValueChange} />
                )}
            </XStack>
        </YStack>
    );
}