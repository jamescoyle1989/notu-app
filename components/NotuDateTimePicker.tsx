import { NotuButton } from '@/helpers/NotuStyles';
import { dateToText, timeToText } from '@/helpers/RenderHelpers';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { XStack } from 'tamagui';

interface NotuDateTimePickerProps {
    value: Date,
    onChange: (value: Date) => void,
    disabled?: boolean,
    hideDate?: boolean,
    hideTime?: boolean
}


export const NotuDateTimePicker = ({
    value,
    onChange,
    disabled = false,
    hideDate = false,
    hideTime = false
}: NotuDateTimePickerProps) => {

    const [showCalendar, setShowCalendar] = useState(false);
    const [showClock, setShowClock] = useState(false);

    function handleDateChange(event: DateTimePickerEvent, selectedDate: Date) {
        onChange(selectedDate);
        setShowCalendar(false);
    }

    function handleTimeChange(event: DateTimePickerEvent, selectedTime: Date) {
        onChange(selectedTime);
        setShowClock(false);
    }

    return (
        <XStack>
            {!hideDate && (
                <NotuButton joinedRight={!hideTime}
                            disabled={disabled}
                            onPress={() => setShowCalendar(true)}>
                    {dateToText(value)}
                </NotuButton>
            )}
            
            {!hideTime && (
                <NotuButton joinedLeft={!hideDate}
                            disabled={disabled}
                            onPress={() => setShowClock(true)}>
                    {timeToText(value)}
                </NotuButton>
            )}

            {showCalendar && (
                <DateTimePicker testID="notuDatePicker"
                                value={value}
                                mode='date'
                                onChange={handleDateChange} />
            )}

            {showClock && (
                <DateTimePicker testID="notuTimePicker"
                                value={value}
                                mode='time'
                                onChange={handleTimeChange} />
            )}
        </XStack>
    );
}