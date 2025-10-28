import { NotuButton, NotuInput, NotuText } from "@/helpers/NotuStyles2";
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

    const [hoursMinsText, setHoursMinsText] = useState(`${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`);
    const [editingHours, setEditingHours] = useState(false);
    const [editingMinutes, setEditingMinutes] = useState(false);
    const daysTextRef = useRef<Input>(null);
    const hoursMinsTextRef = useRef<Input>(null);

    useEffect(() => {
        if (editingMinutes) {
            const colonIndex = hoursMinsText.indexOf(':');
            if (colonIndex >= 0) {
                hoursMinsTextRef.current.setSelection(colonIndex + 1, hoursMinsText.length);
            }
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
    }

    let blockSelectionChangeHandling = false;
    function onHoursMinsSelectionChange(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) {
        if (!hoursMinsTextRef.current)
            return;
        if (blockSelectionChangeHandling)
            return;

        const colonIndex = hoursMinsText.indexOf(':');
        if (colonIndex == -1) {
            hoursMinsTextRef.current.setSelection(0, hoursMinsText.length);
            setEditingHours(true);
            setEditingMinutes(false);
        }
        else if (e.nativeEvent.selection.end <= colonIndex) {
            hoursMinsTextRef.current.setSelection(0, colonIndex);
            setEditingHours(true);
            setEditingMinutes(false);
        }
        else if (e.nativeEvent.selection.start > colonIndex) {
            hoursMinsTextRef.current.setSelection(colonIndex + 1, hoursMinsText.length);
            setEditingHours(false);
            setEditingMinutes(true);
        }
        else {
            hoursMinsTextRef.current.setSelection(0, hoursMinsText.length);
            setEditingHours(true);
            setEditingMinutes(false);
        }
    }

    function onHoursMinsTextChange(value: string) {
        if (!hoursMinsTextRef.current)
            return;
        const newColonIndex = value.indexOf(':');
        if (editingHours) {
            const hoursText = newColonIndex >= 0 ? value.substring(0, newColonIndex) : value;
            const hoursVal = parseTimePortion(hoursText);

            if ((hoursVal >= 10 && hoursVal < 24) || (hoursVal < 10 && hoursVal > 2) || (hoursText.length == 2 && hoursVal <= 2)) {
                const newText = `${hoursVal.toString().padStart(2, '0')}${value.substring(newColonIndex)}`;
                setHoursMinsText(newText);
                setEditingHours(false);
                setEditingMinutes(true);
                onChange(convertToMilliseconds(totalDays, hoursVal, remainingMinutes));
            }
            else {
                if (hoursVal < 24)
                    onChange(convertToMilliseconds(totalDays, hoursVal, remainingMinutes));
                setHoursMinsText(`${hoursVal.toString()}${value.substring(newColonIndex)}`);
            }
        }
        else if (editingMinutes) {
            const minsText = value.substring(newColonIndex + 1);
            const minsVal = parseTimePortion(minsText);

            if ((minsVal >= 10 && minsVal < 60) || (minsVal < 10 && minsVal > 5) || (minsText.length == 2 && minsVal <= 5)) {
                const newText = `${value.substring(0, newColonIndex + 1)}${minsVal.toString().padStart(2, '0')}`;
                setHoursMinsText(newText);
                setEditingMinutes(false);
                hoursMinsTextRef.current.blur();
                onChange(convertToMilliseconds(totalDays, remainingHours, minsVal));
            }
            else {
                if (minsVal < 60)
                    onChange(convertToMilliseconds(totalDays, remainingHours, minsVal));
                setHoursMinsText(`${value.substring(0, newColonIndex + 1)}${minsVal.toString()}`);
            }
        }
        blockSelectionChangeHandling = true;
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
                       value={hoursMinsText}
                       contextMenuHidden={true}
                       onSelectionChange={onHoursMinsSelectionChange}
                       onChangeText={onHoursMinsTextChange} />
        </XStack>
    )
}