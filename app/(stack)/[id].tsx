import { GroupedSearchList } from "@/components/GroupedSearchList";
import { ShowEditorAction, ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import { getNotu } from "@/helpers/NotuSetup";
import { CommonSpace } from "@/spaces/common/CommonSpace";
import { PageData } from "@/spaces/common/PageNoteTagData";
import { ProcessesSpace } from "@/spaces/processes/ProcessesSpace";
import { ProcessDataBase } from "@/spaces/processes/ProcessNoteTagDataBaseClass";
import { DrawerActions } from "@react-navigation/native";
import { Menu } from '@tamagui/lucide-icons';
import { Stack, useLocalSearchParams, useNavigation, usePathname, useRouter } from "expo-router";
import { Note, NoteTag } from "notu";
import { useEffect, useRef, useState } from "react";
import { Button, Text, View, YStack } from "tamagui";
import { setNoteBeingEdited } from "./editnote";
import { setActiveNoteListAction } from "./listnoteobjects";

export default function CustomPage() {
    const { id } = useLocalSearchParams();
    const pathName = usePathname();
    const [pageNote, setPageNote] = useState<Note>(null);
    const renderTools = getNotu();
    const notu = renderTools.notu;
    const router = useRouter();
    const nav = useNavigation();
    const searchListRef = useRef(null);

    useEffect(() => {
        setPageNote(null);
        async function loadPage() {
            //I hate that I've had to put this line here, but otherwise the drawer just stays open when switching between screens
            nav.dispatch(DrawerActions.closeDrawer());
            const idn = Number(id);
            setPageNote((await notu.getNotes(`n.id = ${idn}`))[0]);
        }
        loadPage();
    }, [pathName]);

    if (!pageNote) {
        return (
            <View flex={1}>
                <Text>Loading...</Text>
            </View>
        )
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
        else if (action.name == 'ShowNoteList') {
            const showNoteListAction = action as ShowNoteListAction;
            setActiveNoteListAction(showNoteListAction);
            router.push('/listnoteobjects');
        }
    }

    async function handleProcessPress(noteTag: NoteTag) {
        const componentFactory = renderTools.getComponentFactoryForNoteTag(noteTag.tag, pageNote);
        const processData = componentFactory.getDataObject(noteTag) as ProcessDataBase;
        console.log('BOO');
        const result = await processData.runProcess(new Note(), notu);
        console.log('HEY!');
        console.log(result);
        onUIAction(result);
    }

    const commonSpace = new CommonSpace(renderTools.notu);
    const processesSpace = new ProcessesSpace(renderTools.notu);
    const pageData = pageNote.getTagData(commonSpace.page, PageData);
    return (
        <View flex={1}>
            <Stack.Screen options={{
                title: pageData.name,
                headerLeft: () => {
                    return (
                        <Menu onPress={() => {
                            nav.dispatch(DrawerActions.openDrawer());
                        }}/>
                    )
                }
            }} />
            <GroupedSearchList ref={searchListRef}
                               query={pageData.query}
                               searchSpace={pageData.searchAllSpaces ? null : pageNote.space}
                               notuRenderTools={renderTools}
                               onUIAction={onUIAction}
                               actionsBar={() => (
                                <YStack>
                                    {pageNote.tags.filter(nt => nt.tag.linksTo(processesSpace.process)).map((nt, index) => {
                                        const baseData = new ProcessDataBase(nt);
                                        return (
                                            <Button theme="highlight" key={index}
                                                    onPress={() => handleProcessPress(nt)}>{baseData.name}</Button>
                                        )
                                    })}
                                </YStack>
                               )} />
        </View>
    )
}