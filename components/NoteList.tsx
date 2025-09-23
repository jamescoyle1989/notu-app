import { Note } from "notu";
import { JSX } from "react";
import { FlatList, View } from "react-native";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import { NoteViewer } from "./NoteViewer";

interface NoteListProps {
    notes: Array<Note>,
    notuRenderTools: NotuRenderTools,
    noteViewer?: (note: Note) => JSX.Element
}


export default function NoteList({
    notes,
    notuRenderTools,
    noteViewer
}: NoteListProps) {

    function renderNoteViewer(note: Note) {
        if (!noteViewer) {
            return (
                <NoteViewer note={note}
                            notuRenderTools={notuRenderTools}/>
            )
        }
        return noteViewer(note);
    }

    return (
        <FlatList data={notes}
                  renderItem={({item}) => (
                    <View key={item.id}>
                        {renderNoteViewer(item)}
                    </View>
                  )}/>
    );
}