import { UIAction } from "@/helpers/NoteAction";
import { Note, Space } from "notu";
import React, { JSX, useImperativeHandle, useRef, useState } from "react";
import { YStack } from "tamagui";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import GroupedNoteList from "./GroupedNoteList";
import { NoteSearch, NoteSearchCommands } from "./NoteSearch";

interface GroupedSearchListProps {
    query?: string,
    searchSpace?: Space,
    notuRenderTools: NotuRenderTools,
    onUIAction: (action: UIAction) => void,
    actionsBar?: () => JSX.Element,
    noteViewer?: (note: Note) => JSX.Element
}


export const GroupedSearchList = React.forwardRef((
    {
        query,
        searchSpace = null,
        notuRenderTools,
        onUIAction,
        actionsBar = null,
        noteViewer = null
    }: GroupedSearchListProps,
    ref: React.ForwardedRef<NoteSearchCommands>
) => {
    
    const [notes, setNotes] = useState<Array<Note>>([]);
    const [queryState, setQueryState] = useState(query);
    const searchRef = useRef(null);

    useImperativeHandle(ref, () => ({
        refresh: () => searchRef.current.refresh()
    }));

    return (
        <YStack>
            <NoteSearch ref={searchRef}
                        space={searchSpace}
                        notu={notuRenderTools.notu}
                        query={queryState}
                        onQueryChanged={s => setQueryState(s)}
                        onFetched={arr => setNotes(arr)}
                        autoFetch={true}/>

            {!!actionsBar && actionsBar()}

            <GroupedNoteList notes={notes}
                             notuRenderTools={notuRenderTools}
                             onUIAction={onUIAction}
                             noteViewer={noteViewer}/>
        </YStack>
    )
});