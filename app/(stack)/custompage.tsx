import { useManualRefresh } from "@/helpers/Hooks";
import { ShowCustomPageAction, ShowEditorAction, UIAction } from "@/helpers/NoteAction";
import { last } from "es-toolkit";
import { Stack, useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";
import { setNoteBeingEdited } from "./editnote";

let _activeCustomPageStack = new Array<ShowCustomPageAction>();
export function setActiveCustomPage(page: ShowCustomPageAction) {
    _activeCustomPageStack.push(page);
}

export default function Index() {
    const navigation = useNavigation();
    const router = useRouter();
    const activePage = last(_activeCustomPageStack);
    const manualRefresh = useManualRefresh();
    const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            const unsubscribe = navigation.addListener('beforeRemove', e => {
                if (e.data.action.type == 'POP')
                    _activeCustomPageStack.pop();
            });
        }, [navigation])
    );

    function onUIAction(action: UIAction) {
        if (action.name == 'Refresh')
            manualRefresh();
        else if (action.name == 'Edit') {
            const editAction = action as ShowEditorAction;
            _activeCustomPageStack.pop();
            setNoteBeingEdited(editAction);
            router.replace('/editnote');
        }
        else if (action.name == 'PreviousScreen') {
            _activeCustomPageStack.pop();
            router.back();
        }
    }

    return (
        <View flex={1} paddingBlockEnd={insets.bottom}>
            <Stack.Screen options={{
                title: activePage.title
            }} />

            {activePage.render(onUIAction)}
        </View>
    );
}