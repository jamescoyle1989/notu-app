import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import s from '../helpers/NotuStyles';

interface NotuDatePickerProps {
    value: Date,
    onChange: (value: Date) => void
}


export const NotuDatePicker = ({
    value,
    onChange
}: NotuDatePickerProps) => {

    const [showCalendar, setShowCalendar] = useState(false);

    function handleDateChange(event: DateTimePickerEvent, selectedDate: Date) {
        onChange(selectedDate);
        setShowCalendar(false);
    }

    return (
        <View style={s.container.background}>
            <TouchableOpacity style={s.touch.button} onPress={() => setShowCalendar(true)}>
                <Text style={s.text.plain}>{value.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showCalendar && (
                <DateTimePicker testID="dateTimePicker"
                                value={value}
                                mode='date'
                                onChange={handleDateChange} />
            )}
        </View>
    );
}