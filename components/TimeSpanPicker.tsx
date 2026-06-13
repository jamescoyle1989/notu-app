import { NotuButton, NotuInput, NotuText } from "@/helpers/NotuStyles";
import { useEffect, useRef, useState } from "react";
import { NativeSyntheticEvent, TextInputSelectionChangeEventData } from "react-native";
import { Input, XStack } from "tamagui";

interface TimespanPickerProps {
    milliseconds: number,
    onChange: (value: number) => void
}


export const TimespanPicker = ({
    milliseconds,
    onChange
}: TimespanPickerProps) => {

    const totalSeconds = Math.floor(milliseconds / 1000);
    const remainingMilliseconds = milliseconds - (totalSeconds * 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds - (totalMinutes * 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes - (totalHours * 60);
    const totalDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours - (totalDays * 24);

    const hoursText = remainingHours.toString().padStart(2, '0');
    const minutesText = remainingMinutes.toString().padStart(2, '0');

    const [editingHours, setEditingHours] = useState(false);
    const [editingMinutes, setEditingMinutes] = useState(false);

    const daysTextRef = useRef<Input>(null);
    const hoursMinsTextRef = useRef<Input>(null);

    useEffect(() => {
        if (editingMinutes) {
                hoursMinsTextRef.current.setSelection(5, 5);
        }
    }, [editingMinutes]);

    function convertToMilliseconds(days: number, hours: number, minutes: number): number {
        const totalHours = (days * 24) + hours;
        const totalMinutes = (totalHours * 60) + minutes;
        const totalSeconds = (totalMinutes * 60) + remainingSeconds;
        return (totalSeconds * 1000) + remainingMilliseconds;
    }

    function onDaysTextChange(value: string) {
        const days = parseTimePortion(value);
        onChange(convertToMilliseconds(days, remainingHours, remainingMinutes));
    }

    function onDaysTextFocus() {
        if (!daysTextRef.current)
            return;
        daysTextRef.current.setSelection(0, totalDays.toString().length);
        setEditingHours(false);
        setEditingMinutes(false);
    }

    let blockSelectionChangeHandling = false;
    function onHoursMinsSelectionChange(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) {
        if (!hoursMinsTextRef.current)
            return;
        if (blockSelectionChangeHandling)
            return;
        const colonIndex = hoursText.length;

        if (e.nativeEvent.selection.end <= colonIndex) {
            hoursMinsTextRef.current.setSelection(colonIndex, colonIndex);
            setEditingHours(true);
            setEditingMinutes(false);
        }
        else if (e.nativeEvent.selection.start > colonIndex) {
            hoursMinsTextRef.current.setSelection(5, 5);
            setEditingHours(false);
            setEditingMinutes(true);
        }
    }

    function onHoursMinsTextChange(value: string) {
        if (!hoursMinsTextRef.current)
            return;
        const newColonIndex = value.indexOf(':');
        
        if (editingHours) {
            const newHoursText = newColonIndex >= 0 ? value.substring(0, newColonIndex) : value;
            const newHoursVal = restrictTimePortion(newHoursText, 23);
            if (newHoursVal * 10 >= 24) {
                setEditingHours(false);
                setEditingMinutes(true);
            }
            onChange(convertToMilliseconds(totalDays, newHoursVal, remainingMinutes));
        }
        else if (editingMinutes) {
            const newMinsText = value.substring(newColonIndex + 1);
            const newMinsVal = restrictTimePortion(newMinsText, 59);
            if (newMinsVal * 10 >= 60) {
                setEditingMinutes(false);
                hoursMinsTextRef.current.blur();
            }
            onChange(convertToMilliseconds(totalDays, remainingHours, newMinsVal));
        }
        blockSelectionChangeHandling = true;
    }

    function restrictTimePortion(newValue: string, maxValue: number): number {
        const maxValueStr = maxValue.toString();
        let outputStr = newValue;
        if (outputStr.length > maxValueStr.length)
            outputStr = outputStr.substring(outputStr.length - maxValueStr.length);

        let output = parseTimePortion(outputStr);
        if (output > maxValue)
            output = parseTimePortion(outputStr.substring(1));

        return output;
    }

    function parseTimePortion(text: string): number {
        let result = 0;
        try { result = Number(text); } catch { }
        if (Number.isNaN(result))
            result = 0;
        return Math.max(0, result);
    }

    return (
        <XStack>
            <NotuInput ref={daysTextRef}
                       joinedRight
                       keyboardType="numeric"
                       value={totalDays.toString()}
                       onChangeText={onDaysTextChange}
                       onFocus={onDaysTextFocus} />
            
            <NotuButton joinedLeft joinedRight>
                <NotuText>day{totalDays == 1 ? '' : 's'}</NotuText>
            </NotuButton>

            <NotuInput ref={hoursMinsTextRef}
                       joinedLeft
                       keyboardType="numeric"
                       value={`${hoursText}:${minutesText}`}
                       contextMenuHidden={true}
                       onSelectionChange={onHoursMinsSelectionChange}
                       onChangeText={onHoursMinsTextChange} />
        </XStack>
    )
}