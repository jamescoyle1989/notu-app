import { Note } from "notu";
import { JSX } from "react";
import { FlatList, View } from "react-native";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import { NoteViewer, NoteViewerAction } from "./NoteViewer";

interface NoteListProps {
    notes: Array<Note>,
    notuRenderTools: NotuRenderTools,
    actionsGenerator: (note: Note) => Array<NoteViewerAction>,
    noteViewer?: (
        note: Note,
        actions: Array<NoteViewerAction>,
        noteTextSplitter: (note: Note) => Array<any>
    ) => JSX.Element
}


export default function NoteList({
    notes,
    notuRenderTools,
    actionsGenerator,
    noteViewer
}: NoteListProps) {

    function renderNoteViewer(note: Note) {
        if (!noteViewer) {
            return (
                <NoteViewer note={note}
                            notuRenderTools={notuRenderTools}
                            actions={actionsGenerator(note)}/>
            )
        }
        return noteViewer(note, actionsGenerator(note), notuRenderTools.noteTextSplitter);
    }

    return (
        <FlatList data={notes}
                  renderItem={({item}) => (
                    <View key={item.id} style={[]}>
                        {renderNoteViewer(item)}
                    </View>
                  )}/>
    )
}