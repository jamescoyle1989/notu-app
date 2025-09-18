import { Text, View } from 'react-native';
import s from '../helpers/NotuStyles';

export default function Page2Screen() {
    return (
        <View style={s.container.background}>
            <Text style={s.text.plain}>Page 2</Text>
        </View>
    )
}