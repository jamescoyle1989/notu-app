import { NotuSelect } from '@/components/NotuSelect';
import { DrawerActions } from '@react-navigation/native';
import { Menu } from '@tamagui/lucide-icons';
import { Stack, useNavigation } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import s from '../../helpers/NotuStyles';

export default function AboutScreen() {
    const nav = useNavigation();
    const [val, setVal] = useState('E');

    return (
        <View style={s.container.background}>
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
            <Text style={s.text.plain}>Hello! Welcome to Notu...{val}</Text>

            <NotuSelect options={[{name: 'A', value: 'Howdy'}, {name: 'B', value: 'Hello'}, {name: 'C', value: 'Bonsoir'}]}
                        value={val}
                        onValueChange={setVal} />
        </View>
    );
}