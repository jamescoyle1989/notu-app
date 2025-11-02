import { NotuText } from '@/helpers/NotuStyles';
import { DrawerActions } from '@react-navigation/native';
import { Menu } from '@tamagui/lucide-icons';
import { Stack, useNavigation } from 'expo-router';
import { View } from 'tamagui';

export default function AboutScreen() {
    const nav = useNavigation();

    return (
        <View backgroundColor="$background" flex={1}>
            <Stack.Screen options={{
                title: 'Home',
                headerLeft: () => {
                    return (
                        <Menu onPress={() => {
                            nav.dispatch(DrawerActions.openDrawer());
                        }}/>
                    )
                }
            }} />
            <NotuText>Hello! Welcome to Notu...</NotuText>
        </View>
    );
}