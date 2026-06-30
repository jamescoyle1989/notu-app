import GroupedNoteList from "@/components/GroupedNoteList";
import { NoteSearch } from "@/components/NoteSearch";
import { ShowCustomPageAction, ShowDynamicPageAction, ShowEditorAction, ShowErrorAction, ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import { getNotu } from "@/helpers/NotuSetup";
import { NotuText } from "@/helpers/NotuStyles";
import { PageData } from "@/spaces/system/PageNoteTagData";
import { ProcessDataBase } from "@/spaces/system/ProcessNoteTagDataBaseClass";
import { FilterComponentFactory, isFilter, SystemSpace } from "@/spaces/system/SystemSpace";
import { last } from "es-toolkit";
import { Stack, useFocusEffect, useNavigation, useRouter } from "expo-router";
import { Note, NoteTag, ParsedQuery, parseQuery } from "notu";
import { useCallback, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, View, YStack } from "tamagui";
import { setActiveCustomPage } from "./custompage";
import { setNoteBeingEdited } from "./editnote";
import { setActiveNoteListAction } from "./listnoteobjects";

let _activeDynamicPageStack = new Array<ShowDynamicPageAction>();
export function setActiveDynamicPage(page: ShowDynamicPageAction) {
    _activeDynamicPageStack.push(page);
}

export default function Index() {
    const navigation = useNavigation();
    const router = useRouter();
    const activePage = last(_activeDynamicPageStack);
    const insets = useSafeAreaInsets();
    const renderTools = getNotu();
    const searchRef = useRef(null);
    const [queryState, setQueryState] = useState(activePage.pageData.query);
    const [fetchedNotes, setFetchedNotes] = useState<Array<Note>>([]);
    const [processError, setProcessError] = useState<string>(null);
    const [pageFilters, setPageFilters] = useState<Array<FilterComponentFactory>>([]);
    const systemSpace = new SystemSpace(renderTools.notu);

    useFocusEffect(
        useCallback(() => {
            const unsubscribe = navigation.addListener('beforeRemove', e => {
                if (e.data.action.type == 'POP')
                    _activeDynamicPageStack.pop();
            });
            const filters = activePage.pageNote.tags
                .map(nt => renderTools.getComponentFactoryForNoteTag(nt.tag, activePage.pageNote))
                .filter(isFilter)
                .map(x => x as FilterComponentFactory);
            setPageFilters(filters);
        }, [navigation])
    );

    let parsedQuery: ParsedQuery;
    try {
        parsedQuery = parseQuery(activePage.pageData.query);
    }
    catch (err) {
    }

    function onUIAction(action: UIAction) {
        setProcessError(null);
        if (action.name == 'Refresh')
            searchRef.current.refresh();
        else if (action.name == 'Edit') {
            const editAction = action as ShowEditorAction;
            setNoteBeingEdited(editAction);
            router.push('/editnote');
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
        else if (action.name == 'PreviousScreen') {
            _activeDynamicPageStack.pop();
            router.back();
        }
    }

    async function handleFilterChange(query: ParsedQuery): Promise<void> {
        setQueryState(query.compose());
    }

    async function handleProcessPress(noteTag: NoteTag) {
        try {
            const componentFactory = renderTools.getComponentFactoryForNoteTag(noteTag.tag, activePage.pageNote);
            const processData = componentFactory.getDataObject(noteTag, activePage.pageNote) as ProcessDataBase;
            const tempPageNote = activePage.pageNote.duplicate();
            const tempPageData = tempPageNote.getTagData(systemSpace.page, PageData);
            tempPageData.query = queryState;
            const result = await processData.runProcess(tempPageNote, renderTools.notu);
            onUIAction(result);
            setProcessError(null);
        }
        catch (err) {
            setProcessError(err.message);
        }
    }

    return (
        <View flex={1} paddingBlockEnd={insets.bottom}>
            <Stack.Screen options={{
                title: activePage.pageData.name
            }} />

            <YStack flex={1}>
                <NoteSearch ref={searchRef}
                            space={activePage.pageData.searchAllSpaces ? null : activePage.pageNote.space}
                            notu={renderTools.notu}
                            query={queryState}
                            onQueryChanged={s => setQueryState(s)}
                            onFetched={arr => setFetchedNotes(arr)}
                            autoFetch={true}
                            visible={activePage.pageData.showQuery} />

                {pageFilters.map((x, index) => (
                    <View key={index}>
                        {x.getFilterComponent(parsedQuery, handleFilterChange, renderTools.notu)}
                    </View>
                ))}

                {activePage.pageNote.tags.filter(nt => nt.tag.linksTo(systemSpace.process)).map((nt, index) => {
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