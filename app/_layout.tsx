import { setupNotu } from "@/helpers/NotuSetup";
import { NotuText } from "@/helpers/NotuStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Href, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { Page } from "notu";
import { ReactNode, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TamaguiProvider, View } from 'tamagui';
import { tamaguiConfig } from '../tamagui.config';


export default function RootLayout() {

    const [isLoaded, setIsLoaded] = useState(false);
    const [customPages, setCustomPages] = useState<Array<Page>>(null);
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
                setCustomPages(await notu.getPages());
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
            <View backgroundColor="$background" flex={1}>
                <NotuText>{error.message}</NotuText>
            </View>
        ));
    }


    if (!isLoaded) {
        return renderInTamagui(() => (
            <View backgroundColor="$background" flex={1}>
                <NotuText>Loading Layout...</NotuText>
            </View>
        ));
    }

    function navigateToPage(href: string) {
        router.replace(href as Href);
    }

    function customDrawerContent(props: DrawerContentComponentProps) {
        return (
            <DrawerContentScrollView {...props}>
                <DrawerItem label="Home" onPress={() => navigateToPage(`/`)} />
                {customPages.map(page => {
                    return (
                        <DrawerItem key={page.id}
                                    label={page.name}
                                    onPress={() => navigateToPage(`/${page.id}`)} />
                    )
                })}
                <DrawerItem label="Toggle Theme" onPress={() => switchColorScheme()} />
            </DrawerContentScrollView>
        )
    }

    return renderInTamagui(() => (
        <GestureHandlerRootView style={{flex: 1}}>
            <Drawer drawerContent={customDrawerContent}
                    screenOptions={{
                        headerShown: false
                    }}>
            </Drawer>
        </GestureHandlerRootView>
    ));
}
