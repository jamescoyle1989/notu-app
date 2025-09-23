import { Note, Space } from "notu";
import { JSX, useRef, useState } from "react";
import { View } from "react-native";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import GroupedNoteList from "./GroupedNoteList";
import { NoteSearch } from "./NoteSearch";

interface GroupedSearchListProps {
    query?: string,
    searchSpace?: Space,
    notuRenderTools: NotuRenderTools,
    actionsBar?: () => JSX.Element,
    noteViewer?: (note: Note) => JSX.Element
}


export default function GroupedSearchList({
    query,
    searchSpace = null,
    notuRenderTools,
    actionsBar = null,
    noteViewer = null
}: GroupedSearchListProps) {
    
    const [notes, setNotes] = useState<Array<Note>>([]);
    const [queryState, setQueryState] = useState(query);
    const searchRef = useRef(null);

    return (
        <View>
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
                             noteViewer={noteViewer}/>
        </View>
    )
};