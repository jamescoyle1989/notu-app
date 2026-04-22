import GroupedNoteList from "@/components/GroupedNoteList";
import { NoteSearch } from "@/components/NoteSearch";
import { ShowCustomPageAction, ShowDynamicPageAction, ShowEditorAction, ShowErrorAction, ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory } from "@/helpers/NotuRenderTools";
import { getNotu } from "@/helpers/NotuSetup";
import { NotuText } from "@/helpers/NotuStyles";
import { PageData } from "@/spaces/system/PageNoteTagData";
import { ProcessDataBase } from "@/spaces/system/ProcessNoteTagDataBaseClass";
import { FilterComponentFactory, SystemSpace } from "@/spaces/system/SystemSpace";
import { DrawerActions } from "@react-navigation/native";
import { Menu } from '@tamagui/lucide-icons';
import { Stack, useLocalSearchParams, useNavigation, usePathname, useRouter } from "expo-router";
import { Note, NoteTag, ParsedQuery, parseQuery } from "notu";
import { useEffect, useRef, useState } from "react";
import { Button, Text, View, YStack } from "tamagui";
import { setActiveCustomPage } from "./custompage";
import { setActiveDynamicPage } from "./dynamicpage";
import { setNoteBeingEdited } from "./editnote";
import { setActiveNoteListAction } from "./listnoteobjects";


function isFilter(compFactory: NoteTagDataComponentFactory) {
    return 'getFilterComponent' in compFactory;
}

function sleep(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

let filterUpdateId = 0;

export default function CustomPage() {
    const { id } = useLocalSearchParams();
    const pathName = usePathname();
    const [pageNote, setPageNote] = useState<Note>(null);
    const [pageFilters, setPageFilters] = useState<Array<FilterComponentFactory>>([]);
    const renderTools = getNotu();
    const notu = renderTools.notu;
    const router = useRouter();
    const nav = useNavigation();
    const searchRef = useRef(null);
    const [queryState, setQueryState] = useState('');
    const [fetchedNotes, setFetchedNotes] = useState<Array<Note>>([]);
    const systemSpace = new SystemSpace(renderTools.notu);
    const pageData = pageNote?.getTagData(systemSpace.page, PageData);
    const [processError, setProcessError] = useState<string>(null);

    useEffect(() => {
        setPageNote(null);
        async function loadPage() {
            //I hate that I've had to put this line here, but otherwise the drawer just stays open when switching between screens
            nav.dispatch(DrawerActions.closeDrawer());

            const idn = Number(id);
            const note = (await notu.getNotes(`n.id = ${idn}`))[0];
            setQueryState(note.getTagData(systemSpace.page, PageData).query);
            const filters = note.tags
                .map(nt => renderTools.getComponentFactoryForNoteTag(nt.tag, note))
                .filter(isFilter)
                .map(x => x as FilterComponentFactory);
            setPageFilters(filters);
            setPageNote(note);
        }
        loadPage();
    }, [pathName]);

    useEffect(() => {
        if (!!pageData?.showQuery || !searchRef.current)
            return;

        async function handleFilterUpdate() {
            filterUpdateId = (filterUpdateId + 1) % 1000;
            const token = filterUpdateId;
            await sleep(500);
            if (token == filterUpdateId)
                searchRef.current.refresh();
        }
        handleFilterUpdate();
    }, [queryState]);

    if (!pageNote) {
        return (
            <View flex={1}>
                <Text>Loading...</Text>
            </View>
        )
    }

    let parsedQuery: ParsedQuery;
    try {
        parsedQuery = parseQuery(pageData.query);
    }
    catch (err) {
    }

    function startEditingNote(action: ShowEditorAction) {
        setNoteBeingEdited(action);
        router.push('/editnote');
    }

    function onUIAction(action: UIAction) {
        setProcessError(null);
        if (action.name == 'Refresh')
            searchRef.current.refresh();
        else if (action.name == 'Edit') {
            const editAction = action as ShowEditorAction;
            startEditingNote(editAction);
        }
        else if (action.name == 'ShowNoteList') {
            const showNoteListAction = action as ShowNoteListAction;
            setActiveNoteListAction(showNoteListAction);
            router.push('/listnoteobjects');
        }
        else if (action.name == 'ShowCustomPage') {
            const showCustomPageAction = action as ShowCustomPageAction;
            setActiveCustomPage(showCustomPageAction);
            router.push('/custompage');
        }
        else if (action.name == 'ShowError') {
            const showErrorAction = action as ShowErrorAction;
            setProcessError(showErrorAction.errorMessage);
        }
        else if (action.name == 'ShowDynamicPage') {
            const showDynamicPageAction = action as ShowDynamicPageAction;
            setActiveDynamicPage(showDynamicPageAction);
            router.push('/dynamicpage');
        }
    }

    async function handleFilterChange(query: ParsedQuery): Promise<void> {
        setQueryState(query.compose());
    }

    async function handleProcessPress(noteTag: NoteTag) {
        try {
            const componentFactory = renderTools.getComponentFactoryForNoteTag(noteTag.tag, pageNote);
            const processData = componentFactory.getDataObject(noteTag) as ProcessDataBase;
            const tempPageNote = pageNote.duplicate();
            const tempPageData = tempPageNote.getTagData(systemSpace.page, PageData);
            tempPageData.query = queryState;
            const result = await processData.runProcess(tempPageNote, notu);
            onUIAction(result);
            setProcessError(null);
        }
        catch (err) {
            setProcessError(err.message);
        }
    }

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

            <YStack flex={1}>
                <NoteSearch ref={searchRef}
                            space={pageData.searchAllSpaces ? null : pageNote.space}
                            notu={renderTools.notu}
                            query={queryState}
                            onQueryChanged={s => setQueryState(s)}
                            onFetched={arr => setFetchedNotes(arr)}
                            autoFetch={true}
                            visible={pageData.showQuery} />

                {pageFilters.map((x, index) => (
                    <View key={index}>
                        {x.getFilterComponent(parsedQuery, handleFilterChange, notu)}
                    </View>
                ))}

                {pageNote.tags.filter(nt => nt.tag.linksTo(systemSpace.process)).map((nt, index) => {
                    const baseData = new ProcessDataBase(nt);
                    return (
                        <Button theme="highlight" key={index}
                                onPress={() => handleProcessPress(nt)}>{baseData.name}</Button>
                    )
                })}

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