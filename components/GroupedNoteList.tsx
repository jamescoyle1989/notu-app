import { UIAction } from "@/helpers/NoteAction";
import { NotuText } from "@/helpers/NotuStyles";
import { Note } from "notu";
import { JSX, useMemo } from "react";
import { SectionList } from "react-native";
import { View } from "tamagui";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import { NoteViewer } from "./NoteViewer";

interface GroupedNoteListProps {
    notes: Array<Note>,
    notuRenderTools: NotuRenderTools,
    onUIAction: (action: UIAction) => void,
    noteViewer?: (note: Note) => JSX.Element
}


class GroupedNotes {
    public notes: Array<Note> = [];

    public title: string = '';

    public constructor(note: Note = null) {
        if (note != null) {
            this.notes.push(note);
            this.title = note.group;
        }
    }
}


export default function GroupedNoteList({
    notes,
    notuRenderTools,
    onUIAction,
    noteViewer
}: GroupedNoteListProps) {

    const groupedNotes = useMemo(() => {
        let output = new Array<GroupedNotes>();
        if (notes.length > 0)
            output.push(new GroupedNotes(notes[0]));
        for (let i = 1; i < notes.length; i++) {
            if (notes[i].group == notes[i - 1].group)
                output[output.length - 1].notes.push(notes[i]);
            else
                output.push(new GroupedNotes(notes[i]));
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
        <SectionList sections={groupedNotes.map(x => ({title: x.title, data: x.notes}))}
                     renderItem={({item}) => (
                        <View key={item.id}>
                            {renderNoteViewer(item)}
                        </View>
                     )}
                     contentContainerStyle={{paddingBottom: 100}}
                     renderSectionHeader={({section}) => {
                        if (section.title != null) {
                            return (<NotuText big bold underline>{section.title}</NotuText>)
                        }
                     }}
                     keyExtractor={item => `${item.id}`}/>
    );
}