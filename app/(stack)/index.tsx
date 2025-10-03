import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { Stack, useNavigation } from 'expo-router';
import { Text, View } from 'react-native';
import s from '../../helpers/NotuStyles';

export default function AboutScreen() {
    const nav = useNavigation();

    return (
        <View style={s.container.background}>
            <Stack.Screen options={{
                title: 'Home',
                headerLeft: () => {
                    return (
                        <Ionicons name="menu"
                                  size={24}
                                  onPress={() => {
                                    nav.dispatch(DrawerActions.openDrawer());
                                  }} />
                    )
                }
            }} />
            <Text style={s.text.plain}>Hello! Welcome to Notu</Text>
        </View>
    );
}