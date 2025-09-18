import { Text, View } from 'react-native';
import s from '../helpers/NotuStyles';

export default function Page1Screen() {
    return (
        <View style={s.container.background}>
            <Text style={s.text.plain}>Page 1</Text>
        </View>
    )
}