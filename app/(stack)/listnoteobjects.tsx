import NoteList from "@/components/NoteList";
import { useManualRefresh } from "@/helpers/Hooks";
import { ShowEditorAction, ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import { getNotu } from "@/helpers/NotuSetup";
import { last } from "es-toolkit";
import { Stack, useFocusEffect, useNavigation, useRouter } from "expo-router";
import { Note } from "notu";
import { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";
import { setNoteBeingEdited } from "./editnote";

let _activeActionStack = new Array<ShowNoteListAction>();
export function setActiveNoteListAction(action: ShowNoteListAction) {
    _activeActionStack.push(action);
}

export default function Index() {
    const navigation = useNavigation();
    const activeAction = last(_activeActionStack);
    const renderTools = getNotu();
    const router = useRouter();
    const manualRefresh = useManualRefresh();
    const insets = useSafeAreaInsets();

    useFocusEffect(
        useCallback(() => {
            const unsubscribe = navigation.addListener('beforeRemove', e => {
                if (e.data.action.type === 'POP')
                    _activeActionStack.pop();
            });
            return unsubscribe;
        }, [navigation])
    );

    function startEditingNote(note: Note) {
        setNoteBeingEdited(note);
        router.push('/editnote');
    }

    function onUIAction(action: UIAction) {
        if (action.name == 'Refresh')
            manualRefresh();
        else if (action.name == 'Edit') {
            const editAction = action as ShowEditorAction;
            startEditingNote(editAction.note);
        }
        else if (action.name == 'ShowNoteList') {
            const showNoteListAction = action as ShowNoteListAction;
            setActiveNoteListAction(showNoteListAction);
            router.push('/listnoteobjects');
        }
        else if (action.name == 'PreviousScreen') {
            _activeActionStack.pop();
            router.back();
        }
    }

    return (
        <View flex={1} paddingBlockEnd={insets.bottom}>
            <Stack.Screen options={{
                title: activeAction.title
            }} />

            {!!activeAction.header && activeAction.header(onUIAction)}

            <NoteList notes={activeAction.notes}
                      notuRenderTools={renderTools}
                      onUIAction={onUIAction}
                      noteViewer={!!activeAction.customNoteViewer
                        ? note => activeAction.customNoteViewer(note, renderTools, onUIAction, null)
                        : undefined
                      } />

            {!!activeAction.footer && activeAction.footer(onUIAction)}
        </View>
    )
}