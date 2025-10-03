import { UIAction } from "@/helpers/NoteAction";
import { Note } from "notu";
import { JSX, useMemo } from "react";
import { SectionList, Text, View } from "react-native";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';
import { NoteViewer } from "./NoteViewer";

interface GroupedNoteListProps {
    notes: Array<Note>,
    notuRenderTools: NotuRenderTools,
    onUIAction: (action: UIAction) => void,
    noteViewer?: (note: Note) => JSX.Element
}


export default function GroupedNoteList({
    notes,
    notuRenderTools,
    onUIAction,
    noteViewer
}: GroupedNoteListProps) {

    const groupedNotes = useMemo(() => {
        let output = new Array<Array<Note>>();
        if (notes.length > 0)
            output.push([notes[0]]);
        for (let i = 1; i < notes.length; i++) {
            if (notes[i].group == notes[i - 1].group)
                output[output.length - 1].push(notes[i]);
            else
                output.push([notes[i]]);
        }
        return output;
    }, [notes]);

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
        <SectionList sections={groupedNotes.map(x => ({title: x[0].group, data: x}))}
                     renderItem={({item}) => (
                        <View key={item.id}>
                            {renderNoteViewer(item)}
                        </View>
                     )}
                     renderSectionHeader={({section}) => (
                        <Text style={[s.text.plain, s.text.bold, s.text.underline, s.text.big]}>{section.title}</Text>
                     )}
                     keyExtractor={item => `${item.id}`}/>
    );
}