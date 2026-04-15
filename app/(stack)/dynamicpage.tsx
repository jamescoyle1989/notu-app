import GroupedNoteList from "@/components/GroupedNoteList";
import { NoteSearch } from "@/components/NoteSearch";
import { useManualRefresh } from "@/helpers/Hooks";
import { ShowDynamicPageAction, ShowEditorAction, UIAction } from "@/helpers/NoteAction";
import { getNotu } from "@/helpers/NotuSetup";
import { NotuText } from "@/helpers/NotuStyles";
import { DrawerActions } from "@react-navigation/native";
import { Menu } from "@tamagui/lucide-icons";
import { last } from "es-toolkit";
import { Stack, useFocusEffect, useNavigation, useRouter } from "expo-router";
import { Note } from "notu";
import { useCallback, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, YStack } from "tamagui";
import { setNoteBeingEdited } from "./editnote";

let _activeDynamicPageStack = new Array<ShowDynamicPageAction>();
export function setActiveDynamicPage(page: ShowDynamicPageAction) {
    _activeDynamicPageStack.push(page);
}

export default function Index() {
    const navigation = useNavigation();
    const router = useRouter();
    const activePage = last(_activeDynamicPageStack);
    const manualRefresh = useManualRefresh();
    const insets = useSafeAreaInsets();
    const renderTools = getNotu();
    const searchRef = useRef(null);
    const [queryState, setQueryState] = useState(activePage.query);
    const [fetchedNotes, setFetchedNotes] = useState<Array<Note>>([]);
    const [processError, setProcessError] = useState<string>(null);

    useFocusEffect(
        useCallback(() => {
            const unsubscribe = navigation.addListener('beforeRemove', e => {
                if (e.data.action.type == 'POP')
                    _activeDynamicPageStack.pop();
            })
        }, [navigation])
    );

    function onUIAction(action: UIAction) {
        if (action.name == 'Refresh')
            manualRefresh();
        else if (action.name == 'Edit') {
            const editAction = action as ShowEditorAction;
            _activeDynamicPageStack.pop();
            setNoteBeingEdited(editAction);
            router.replace('/editnote');
        }
        else if (action.name == 'PreviousScreen') {
            _activeDynamicPageStack.pop();
            router.back();
        }
    }

    return (
        <View flex={1} paddingBlockEnd={insets.bottom}>
            <Stack.Screen options={{
                title: activePage.title,
                headerLeft: () => {
                    return (
                        <Menu onPress={() => {
                            navigation.dispatch(DrawerActions.openDrawer());
                        }} />
                    )
                }
            }} />

            <YStack flex={1}>
                <NoteSearch ref={searchRef}
                            space={activePage.space}
                            notu={renderTools.notu}
                            query={queryState}
                            onQueryChanged={s => setQueryState(s)}
                            onFetched={arr => setFetchedNotes(arr)}
                            autoFetch={true}
                            visible={true} />
                
                {!!processError && (
                    <NotuText danger>{processError}</NotuText>
                )}

                <GroupedNoteList notes={fetchedNotes}
                                 notuRenderTools={renderTools}
                                 onUIAction={onUIAction} />
            </YStack>
        </View>
    )
}