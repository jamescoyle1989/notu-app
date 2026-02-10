import { getNotu, setupNotu } from "@/helpers/NotuSetup";
import { NotuText } from "@/helpers/NotuStyles";
import { PageData } from "@/spaces/system/PageNoteTagData";
import { SystemSpace } from "@/spaces/system/SystemSpace";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Href, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Note, Notu } from "notu";
import { ReactNode, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider, View } from 'tamagui';
import { tamaguiConfig } from '../tamagui.config';


export default function RootLayout() {

    const [isLoaded, setIsLoaded] = useState(false);
    const [pageNotes, setPageNotes] = useState<Array<Note>>([]);
    const [error, setError] = useState(null);
    const router = useRouter();

    const defaultColorScheme = useColorScheme().toString();
    const [colorScheme, setColorScheme] = useState(defaultColorScheme);

    function switchColorScheme() {
        const schemes = ['light', 'dark'];
        const newScheme = schemes[(schemes.indexOf(colorScheme) + 1) % 2];
        setColorScheme(newScheme);
        AsyncStorage.setItem('color-scheme', newScheme);
    }

    useEffect(() => {
        async function loadSetupData() {
            try {
                const renderTools = await setupNotu();
                const notu = renderTools.notu;
                const fetchedColorScheme = await AsyncStorage.getItem('color-scheme');
                if (!!fetchedColorScheme)
                    setColorScheme(fetchedColorScheme);
                await reloadPages(notu);
                setIsLoaded(true);
            }
            catch (err) {
                setError(err);
            }
        }
        loadSetupData();
    }, []);


    function renderInTamagui(content: () => ReactNode) {
        return (
            <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    {content()}
                </ThemeProvider>
            </TamaguiProvider>
        );
    }


    if (error != null) {
        return renderInTamagui(() => (
            <View bg="$background" flex={1}>
                <NotuText>Error: {error.message}</NotuText>

            </View>
        ));
    }


    if (!isLoaded) {
        return renderInTamagui(() => (
            <View bg="$background" flex={1}>
                <NotuText>Loading Layout...</NotuText>
            </View>
        ));
    }

    function navigateToPage(href: string) {
        router.replace(href as Href);
    }

    async function reloadPages(notu: Notu) {
        setPageNotes(await notu.getNotes(`#System.Page`));
    }

    function customDrawerContent(props: DrawerContentComponentProps) {
        const renderTools = getNotu();
        reloadPages(renderTools.notu);
        const systemSpace = new SystemSpace(renderTools.notu);
        return (
            <DrawerContentScrollView {...props}>
                <DrawerItem label="Home" onPress={() => navigateToPage(`/`)} />
                {pageNotes.map(page => {

                    return (
                        <DrawerItem key={page.id}
                                    label={page.getTagData(systemSpace.page, PageData).name}
                                    onPress={() => navigateToPage(`/${page.id}`)} />
                    )
                })}
                <DrawerItem label="Toggle Theme" onPress={() => switchColorScheme()} />
            </DrawerContentScrollView>
        )
    }

    return renderInTamagui(() => (
        <SafeAreaProvider>
            <Drawer drawerContent={customDrawerContent}
                    screenOptions={{
                        headerShown: false,
                        swipeEnabled: false
                    }}>
            </Drawer>
        </SafeAreaProvider>
    ));
}
