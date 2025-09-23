import { Note, Space } from "notu";
import React, { JSX, useRef, useState } from "react";
import { View } from "react-native";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import NoteList from "./NoteList";
import { NoteSearch } from "./NoteSearch";

interface SearchListProps {
    /** The query string which the search field will display and use for querying, changes to this won't be tracked */
    query?: string,
    /** The space which we're fetching notes from, if null then we're searching across all spaces */
    searchSpace?: Space,
    notuRenderTools: NotuRenderTools,
    actionsBar?: () => JSX.Element,
    noteViewer?: (note: Note) => JSX.Element
}


export default function SearchList({
    query,
    searchSpace = null,
    notuRenderTools,
    actionsBar = null,
    noteViewer = null
}: SearchListProps) {

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

            <NoteList notes={notes}
                      notuRenderTools={notuRenderTools}
                      noteViewer={noteViewer}/>
        </View>
    )
};