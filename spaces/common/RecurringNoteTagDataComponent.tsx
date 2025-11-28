import { NotuDateTimePicker } from "@/components/NotuDateTimePicker";
import { NumberInput } from "@/components/NumberInput";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuButton, NotuText } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Checkbox, CheckedState, Label, XStack, YStack } from "tamagui";
import { RecurringData } from "./RecurringNoteTagData";

export default class RecurringNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new RecurringData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;

    function handleMinDaysBetweenChange(newValue: number) {
        data.minDaysBetween = newValue;
        manualRefresh();
    }

    function handleDaysLookaheadChange(newValue: number) {
        data.daysLookahead = newValue;
        manualRefresh();
    }

    function handleTimeOfDayChange(newValue: Date) {
        data.timeOfDay = newValue;
        manualRefresh();
    }

    function handleIsCyclicToggle(checkState: CheckedState) {
        if (checkState.valueOf() == true) {
            data.daysPerCycle = 1;
            data.timesPerCycle = 1;
        }
        else {
            data.daysPerCycle = null;
            data.timesPerCycle = null;
        }
        manualRefresh();
    }

    function handleTimesPerCycleChange(newValue: number) {
        data.timesPerCycle = newValue;
        manualRefresh();
    }

    function handleDaysPerCycleChange(newValue: number) {
        data.daysPerCycle = newValue;
        manualRefresh();
    }

    function handleUsesDaysOfWeekToggle(checkState: CheckedState) {
        if (checkState.valueOf() == true)
            data.daysOfWeek = [];
        else if (checkState.valueOf() == false)
            data.daysOfWeek = null;
        manualRefresh();
    }

    function dayOfWeekToName(dayOfWeek: number): string {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
    }

    function toggleDayOfWeekSelected(dayOfWeek: number) {
        if (data.daysOfWeek.includes(dayOfWeek))
            data.daysOfWeek = data.daysOfWeek.filter(x => x != dayOfWeek);
        else {
            data.daysOfWeek.push(dayOfWeek);
            noteTag.dirty();
        }
        manualRefresh();
    }

    function handleUsesDaysOfMonthToggle(checkState: CheckedState) {
        if (checkState.valueOf() == true)
            data.daysOfMonth = [];
        else if (checkState.valueOf() == false)
            data.daysOfMonth = null;
        manualRefresh();
    }

    function toggleDayOfMonthSelected(day: number) {
        if (data.daysOfMonth.includes(day))
            data.daysOfMonth = data.daysOfMonth.filter(x => x != day);
        else {
            data.daysOfMonth.push(day);
            noteTag.dirty();
        }
        manualRefresh();
    }

    function handleUsesMonthsOfYearToggle(checkState: CheckedState) {
        if (checkState.valueOf() == true)
            data.monthsOfYear = [];
        else if (checkState.valueOf() == false)
            data.monthsOfYear = null;
        manualRefresh();
    }

    function monthOfYearToName(monthOfYear: number) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthOfYear - 1];
    }

    function toggleMonthOfYearSelected(month: number) {
        if (data.monthsOfYear.includes(month))
            data.monthsOfYear = data.monthsOfYear.filter(x => x != month);
        else {
            data.monthsOfYear.push(month);
            noteTag.dirty();
        }
        manualRefresh();
    }

    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Min Days Between</Label>
                <NumberInput value={data.minDaysBetween} onChange={handleMinDaysBetweenChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Days Lookahead</Label>
                <NumberInput value={data.daysLookahead} onChange={handleDaysLookaheadChange} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Time of Day</Label>
                <NotuDateTimePicker value={data.timeOfDay}
                                    onChange={handleTimeOfDayChange}
                                    hideDate />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Times Per Cycle</Label>
                <Checkbox checked={data.isCyclic} onCheckedChange={handleIsCyclicToggle}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>

            {data.isCyclic && (
                <XStack style={{alignItems: 'center'}}>
                    <NumberInput value={data.timesPerCycle} onChange={handleTimesPerCycleChange} />
                    <NotuText> time{data.timesPerCycle == 1 ? '' : 's'} every </NotuText>
                    <NumberInput value={data.daysPerCycle} onChange={handleDaysPerCycleChange} />
                    <NotuText> day{data.daysPerCycle == 1 ? '' : 's'}</NotuText>
                </XStack>
            )}

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Days of Week</Label>
                <Checkbox checked={data.daysOfWeek != null} onCheckedChange={handleUsesDaysOfWeekToggle}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>

            {data.daysOfWeek != null && (
                <XStack style={{alignItems: 'center'}} flexWrap="wrap">
                    {[1,2,3,4,5,6,0].map(dayOfWeek => (
                        <NotuButton key={dayOfWeek} width={70}
                                    theme={data.daysOfWeek.includes(dayOfWeek) ? 'highlight' : ''}
                                    onPress={() => toggleDayOfWeekSelected(dayOfWeek)}>
                            {dayOfWeekToName(dayOfWeek)}
                        </NotuButton>
                    ))}
                </XStack>
            )}

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Days of Month</Label>
                <Checkbox checked={data.daysOfMonth != null} onCheckedChange={handleUsesDaysOfMonthToggle}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>

            {data.daysOfMonth != null && (
                <YStack>
                    {[
                        [ 1, 2, 3, 4, 5, 6, 7],
                        [ 8, 9,10,11,12,13,14],
                        [15,16,17,18,19,20,21],
                        [22,23,24,25,26,27,28],
                        [29,30,31]
                    ].map(week => (
                        <XStack key={`week${week[0]}`} marginInlineStart={20}>
                            {week.map(day => (
                                <NotuText key={day}
                                          width={40}
                                          marginBottom={10}
                                          pressable={!data.daysOfMonth.includes(day)}
                                          onPress={() => toggleDayOfMonthSelected(day)}
                                          bold={data.daysOfMonth.includes(day)}>
                                    {day}
                                </NotuText>
                            ))}
                        </XStack>
                    ))}
                    <Label>Days from End of Month</Label>
                    {[
                        [31,30,29,28,27,26,25],
                        [24,23,22,21,20,19,18],
                        [17,16,15,14,13,12,11],
                        [10, 9, 8, 7, 6, 5, 4],
                        [ 3, 2, 1]
                    ].map(week => (
                        <XStack key={`week${week[0]}`} marginInlineStart={20}>
                            {week.map(day => (
                                <NotuText key={day}
                                          width={40}
                                          marginBottom={10}
                                          pressable={!data.daysOfMonth.includes(-day)}
                                          onPress={() => toggleDayOfMonthSelected(-day)}
                                          bold={data.daysOfMonth.includes(-day)}>
                                    {day}
                                </NotuText>
                            ))}
                        </XStack>
                    ))}
                </YStack>
            )}

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Months of Year</Label>
                <Checkbox checked={data.monthsOfYear != null} onCheckedChange={handleUsesMonthsOfYearToggle}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>

            {data.monthsOfYear != null && (
                <XStack style={{alignItems: 'center'}} flexWrap="wrap">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
                        <NotuButton key={month} width={70}
                                    theme={data.monthsOfYear.includes(month) ? 'highlight' : ''}
                                    onPress={() => toggleMonthOfYearSelected(month)}>
                            {monthOfYearToName(month)}
                        </NotuButton>
                    ))}
                </XStack>
            )}
        </YStack>
    );
}