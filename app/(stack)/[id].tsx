import { GroupedSearchList } from "@/components/GroupedSearchList";
import { ShowEditorAction, UIAction } from "@/helpers/NoteAction";
import { getNotu } from "@/helpers/NotuSetup";
import { DrawerActions } from "@react-navigation/native";
import { Menu } from '@tamagui/lucide-icons';
import { Stack, useLocalSearchParams, useNavigation, usePathname, useRouter } from "expo-router";
import { Note, Page } from "notu";
import { useEffect, useRef, useState } from "react";
import { Button, Text, View } from "tamagui";
import { setNoteBeingEdited } from "./editnote";

export default function CustomPage() {
    const { id } = useLocalSearchParams();
    const pathName = usePathname();
    const [page, setPage] = useState<Page>(null);
    const renderTools = getNotu();
    const notu = renderTools.notu;
    const router = useRouter();
    const nav = useNavigation();
    const searchListRef = useRef(null);

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
            <View flex={1}>
                <Text>Loading...</Text>
            </View>
        )
    }

    function addNote() {
        startEditingNote(new Note('test test').in(page.space));
    }

    function startEditingNote(note: Note) {
        setNoteBeingEdited(note);
        router.push('/editnote');
    }

    function onUIAction(action: UIAction) {
        if (action.name == 'Refresh')
            searchListRef.current.refresh();
        else if (action.name == 'Edit') {
            const editAction = action as ShowEditorAction;
            startEditingNote(editAction.note);
        }
    }

    return (
        <View flex={1}>
            <Stack.Screen options={{
                title: page.name,
                headerLeft: () => {
                    return (
                        <Menu onPress={() => {
                            nav.dispatch(DrawerActions.openDrawer());
                        }}/>
                    )
                }
            }} />
            <GroupedSearchList ref={searchListRef}
                               query={page.query}
                               searchSpace={page.space}
                               notuRenderTools={renderTools}
                               onUIAction={onUIAction}
                               actionsBar={() => (
                                <Button onPress={addNote}>Add Note</Button>
                               )} />
        </View>
    )
}