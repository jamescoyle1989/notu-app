import GroupedSearchList from "@/components/GroupedSearchList";
import { getNotu } from "@/helpers/NotuSetup";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerActions } from "@react-navigation/native";
import { Link, Stack, useLocalSearchParams, useNavigation, usePathname } from "expo-router";
import { Page } from "notu";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import s from '../../helpers/NotuStyles';

export default function CustomPage() {
    const { id } = useLocalSearchParams();
    const pathName = usePathname();
    const [page, setPage] = useState<Page>(null);
    const renderTools = getNotu();
    const notu = renderTools.notu;
    const nav = useNavigation();

    useEffect(() => {
        setPage(null);
        async function loadPage() {
            //I hate that I've had to put this line here, but otherwise the drawer just stays open when switching between screens
            nav.dispatch(DrawerActions.closeDrawer());
            setPage(await notu.getPage(Number(id)));
        }
        loadPage();
    }, [pathName]);

    if (!page) {
        return (
            <View style={s.container.background}>
                <Text style={s.text.plain}>Loading...</Text>
            </View>
        )
    }

    return (
        <View style={s.container.background}>
            <Stack.Screen options={{
                title: page.name,
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
            <Link href="/about" push asChild>
                <Text style={s.text.plain}>Go to child about page</Text>
            </Link>
            <GroupedSearchList query={page.query}
                               searchSpace={page.space}
                               notuRenderTools={renderTools}
                               actionsBar={() => (
                                <Text style={s.text.plain}>Hello from actions bar</Text>
                               )} />
        </View>
    )
}