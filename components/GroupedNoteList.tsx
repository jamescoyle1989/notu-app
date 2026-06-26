import { UIAction } from "@/helpers/NoteAction";
import { NotuText } from "@/helpers/NotuStyles";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { Note } from "notu";
import { JSX, useEffect, useState } from "react";
import { SectionList } from "react-native";
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

    public expanded: boolean = true;

    public expandedManuallyChanged: boolean = false;

    public constructor(note: Note = null) {
        if (note != null) {
            this.notes.push(note);
            this.title = note.group;
            if (!!this.title && this.title.endsWith('!~@MIN@~!')) {
                this.expanded = false;
                this.title = this.title.replace('!~@MIN@~!', '');
            }
        }
    }
}


export default function GroupedNoteList({
    notes,
    notuRenderTools,
    onUIAction,
    noteViewer
}: GroupedNoteListProps) {

    const [groupedNotes, setGroupedNotes] = useState<Array<GroupedNotes>>([]);
    const [noteIdsToGroups, setNoteIdsToGroups] = useState<Map<number, GroupedNotes>>(new Map());

    useEffect(() => {
        const output = new Array<GroupedNotes>();
        const map = new Map<number, GroupedNotes>();
        
        if (notes.length > 0) {
            const group = new GroupedNotes(notes[0]);
            output.push(group);
            map.set(notes[0].id, group);
        }

        for (let i = 1; i < notes.length; i++) {
            if (notes[i].group == notes[i - 1].group) {
                output[output.length - 1].notes.push(notes[i]);
                map.set(notes[i].id, output[output.length - 1]);
            }
            else {
                const group = new GroupedNotes(notes[i]);
                output.push(group);
                map.set(notes[i].id, group);
            }
        }
        
        for (const group of output) {
            const existingGroup = groupedNotes.find(x => x.title == group.title);
            if (!!existingGroup && existingGroup.expandedManuallyChanged)
                group.expanded = existingGroup.expanded;
        }

        setGroupedNotes(output);
        setNoteIdsToGroups(map);
    }, [notes]);

    function findGroupIndex(groupNotes: Array<Note>): number {
        if (groupNotes.length == 0)
            return -1;
        const findId = groupNotes[0].id;
        for (let i = 0; i < groupedNotes.length; i++) {
            const group = groupedNotes[i];
            if (group.notes.find(x => x.id == findId))
                return i;
        }
        return -1;
    }

    function onGroupTitlePress(groupNotes: Array<Note>): void {
        const groupIndex = findGroupIndex(groupNotes);
        if (groupIndex < 0)
            return;

        const newData = groupedNotes.slice();
        newData[groupIndex].expanded = !newData[groupIndex].expanded;
        newData[groupIndex].expandedManuallyChanged = true;
        setGroupedNotes(newData);
    }

    function renderSectionChevron(groupNotes: Array<Note>) {
        const groupIndex = findGroupIndex(groupNotes);
        if (groupIndex < 0 || !groupedNotes[groupIndex].expanded)
            return (<ChevronUp size={15} marginEnd={5} />);
        return (<ChevronDown size={15} marginEnd={5} />);
    }

    function renderNote(note: Note) {
        if (!noteIdsToGroups.get(note.id).expanded)
            return;
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
                     renderItem={({item}) => renderNote(item)}
                     contentContainerStyle={{paddingBottom: 100}}
                     renderSectionHeader={({section}) => {
                        if (section.title != null) {
                            return (<NotuText big bold underline onPress={() => onGroupTitlePress(section.data)}>
                                {renderSectionChevron(section.data)} {section.title}
                            </NotuText>)
                        }
                     }}
                     keyExtractor={item => `${item.id}`}/>
    );
}