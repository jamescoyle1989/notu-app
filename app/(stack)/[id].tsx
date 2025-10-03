import { GroupedSearchList } from "@/components/GroupedSearchList";
import { ShowEditorAction, UIAction } from "@/helpers/NoteAction";
import { getNotu } from "@/helpers/NotuSetup";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerActions } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useNavigation, usePathname, useRouter } from "expo-router";
import { Note, Page } from "notu";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import s from '../../helpers/NotuStyles';
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
            <View style={s.container.background}>
                <Text style={s.text.plain}>Loading...</Text>
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
            <GroupedSearchList ref={searchListRef}
                               query={page.query}
                               searchSpace={page.space}
                               notuRenderTools={renderTools}
                               onUIAction={onUIAction}
                               actionsBar={() => (
                                <TouchableOpacity style={s.touch.button}
                                                  onPress={addNote}>
                                    <Text style={s.text.plain}>Add Note</Text>
                                </TouchableOpacity>
                               )} />
        </View>
    )
}