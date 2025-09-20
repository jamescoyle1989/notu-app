import { setupNotu } from "@/helpers/NotuSetup";
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import { Href, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Page } from "notu";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import s from '../helpers/NotuStyles';


export default function RootLayout() {

    const [isLoaded, setIsLoaded] = useState(false);
    const [customPages, setCustomPages] = useState<Array<Page>>(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function loadCustomPages() {
            try {
                const renderTools = await setupNotu();
                const notu = renderTools.notu;
                setCustomPages(await notu.getPages());
                setIsLoaded(true);
            }
            catch (err) {
                setError(err);
            }
        }
        loadCustomPages();
    }, []);


    if (error != null) {
        return (
            <View style={s.container.background}>
                <Text style={s.text.plain}>{error.message}</Text>
            </View>
        );
    }


    if (!isLoaded) {
        return (
            <View style={s.container.background}>
                <Text style={s.text.plain}>Loading Layout...</Text>
            </View>
        );
    }

    function customDrawerContent(props: DrawerContentComponentProps) {
        return (
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
                {customPages.map(page => {
                    return (
                        <DrawerItem key={page.id}
                                    label={page.name}
                                    onPress={() => router.push(`/${page.id}` as Href)} />
                    )
                })}
            </DrawerContentScrollView>
        )
    }

    
    return (
        <Drawer drawerContent={customDrawerContent}>
            <Drawer.Screen name="index"
                           options={{
                            drawerLabel: 'Home',
                            title: 'Home'
                           }} />

            <Drawer.Screen name="about"
                           options={{
                            drawerLabel: 'About',
                            title: 'About'
                           }} />

            <Drawer.Screen name="[id]"
                           options={{
                            drawerItemStyle: {
                                display: 'none'
                            }
                           }} />
        </Drawer>
    )
}
