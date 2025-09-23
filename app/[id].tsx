import GroupedSearchList from "@/components/GroupedSearchList";
import { getNotu } from "@/helpers/NotuSetup";
import { Stack, useLocalSearchParams, usePathname } from "expo-router";
import { Page } from "notu";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import s from '../helpers/NotuStyles';

export default function CustomPage() {
    const { id } = useLocalSearchParams();
    const pathName = usePathname();
    const [page, setPage] = useState<Page>(null);
    const renderTools = getNotu();
    const notu = renderTools.notu;

    useEffect(() => {
        setPage(null);
        async function loadPage() {
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
            <Stack.Screen options={{title: page.name}} />
            <GroupedSearchList query={page.query}
                               searchSpace={page.space}
                               notuRenderTools={renderTools}
                               actionsBar={() => (
                                <Text style={s.text.plain}>Hello from actions bar</Text>
                               )} />
        </View>
    )
}