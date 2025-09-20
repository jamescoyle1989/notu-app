import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import s from '../helpers/NotuStyles';

export default function Page() {
    const { id } = useLocalSearchParams();

    return (
        <View style={s.container.background}>
            <Text style={s.text.plain}>Page ID: {id}</Text>
        </View>
    )
}