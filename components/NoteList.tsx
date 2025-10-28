import { UIAction } from "@/helpers/NoteAction";
import { Note } from "notu";
import { JSX } from "react";
import { FlatList } from "react-native";
import { View } from "tamagui";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import { NoteViewer } from "./NoteViewer";

interface NoteListProps {
    notes: Array<Note>,
    notuRenderTools: NotuRenderTools,
    onUIAction: (action: UIAction) => void,
    noteViewer?: (note: Note) => JSX.Element
}


export default function NoteList({
    notes,
    notuRenderTools,
    onUIAction,
    noteViewer
}: NoteListProps) {

    function renderNoteViewer(note: Note) {
        if (!noteViewer) {
            return (
                <NoteViewer note={note}
                            notuRenderTools={notuRenderTools}
                            onUIAction={onUIAction}/>
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