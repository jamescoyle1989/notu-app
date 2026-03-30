import SpaceEditor from "@/components/SpaceEditor";
import { getNotu } from "@/helpers/NotuSetup";
import { NotuButton, NotuText } from "@/helpers/NotuStyles";
import SystemSpaceDefs from "@/spaces/system/SystemSpaceDefs";
import { DrawerActions } from "@react-navigation/native";
import { Menu, Pencil } from "@tamagui/lucide-icons";
import { Stack, useNavigation } from "expo-router";
import { Space } from "notu";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack } from "tamagui";

export default function Spaces() {
    const renderTools = getNotu();
    const notu = renderTools.notu;
    const nav = useNavigation();
    const [spaceBeingEdited, setSpaceBeingEdited] = useState<Space>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        //I hate that I've had to put this line here, but otherwise the drawer just stays open when switching between screens
        nav.dispatch(DrawerActions.closeDrawer());
    }, []);

    function addSpace() {
        const newSpace = new Space('').v('0.0.0');
        setSpaceBeingEdited(newSpace);
    }

    function editSpace(space: Space) {
        setSpaceBeingEdited(space);
    }

    return (
        <YStack flex={1} marginBlockEnd={insets.bottom}>
            <Stack.Screen options={{
                title: 'Spaces',
                headerLeft: () => {
                    return (
                        <Menu onPress={() => {
                            nav.dispatch(DrawerActions.openDrawer());
                        }} />
                    );
                }
            }} />

            <FlatList data={notu.getSpaces()}
                      renderItem={({item}) => (
                        <XStack key={item.id}
                              borderBottomColor="$borderColor"
                              borderBottomWidth={1}
                              style={{alignItems: 'center'}}
                              height={30}>
                            <NotuText bold>{item.name}</NotuText>
                            <NotuText marginInlineStart={5}>{item.internalName}</NotuText>
                            {item.internalName != SystemSpaceDefs.internalName && (
                                <Pencil marginInlineStart={5} size={15} onPress={() => editSpace(item)} />
                            )}
                        </XStack>
                      )} />
            
            {!spaceBeingEdited && (
                <NotuButton onPress={addSpace} theme="highlight">Add Space</NotuButton>
            )}
            {!!spaceBeingEdited && (
                <SpaceEditor space={spaceBeingEdited}
                             notuRenderTools={renderTools}
                             onFinished={() => setSpaceBeingEdited(null)} />
            )}
        </YStack>
    );
}