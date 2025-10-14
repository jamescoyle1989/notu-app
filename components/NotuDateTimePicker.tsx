import { dateToText, timeToText } from '@/helpers/RenderHelpers';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import s from '../helpers/NotuStyles';

interface NotuDateTimePickerProps {
    value: Date,
    onChange: (value: Date) => void,
    hideDate?: boolean,
    hideTime?: boolean
}


export const NotuDateTimePicker = ({
    value,
    onChange,
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
        <View style={s.container.row}>
            {!hideDate && (
                <TouchableOpacity style={[s.touch.button, !hideTime && s.border.joinedRight]}
                                  onPress={() => setShowCalendar(true)}>
                    <Text style={s.text.plain}>{dateToText(value)}</Text>
                </TouchableOpacity>
            )}
            
            {!hideTime && (
                <TouchableOpacity style={[s.touch.button, !hideDate && s.border.joinedLeft]}
                                  onPress={() => setShowClock(true)}>
                    <Text style={s.text.plain}>{timeToText(value)}</Text>
                </TouchableOpacity>
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
        </View>
    );
}