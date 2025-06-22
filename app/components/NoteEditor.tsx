import { Note, Tag } from "notu";
import { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useManualRefresh } from "../helpers/Hooks";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';
import TagEditor from "./TagEditor";

interface NoteEditorProps {
    notuRenderTools: NotuRenderTools,
    note: Note,
    /** The collection of tags that the note editor has access to */
    tags: Array<Tag>,
    /** Called when the confirm button is clicked. A false return value will prevent saving, so will a thrown error, which will also display on the note editor */
    canSave?: (note: Note) => Promise<boolean>,
    /** Called when canSave has indicated that the NoteEditor should proceed with the save, and the save has gone through successfully */
    onSave: (note: Note) => void,
    /** Called when the cancel button is clicked */
    onCancel: (note: Note) => void,
    /** Default mode is Optional, which allows the user to choose if they want to give a note its own tag. Required prevents saving unless the note has a tag, and forbidden prevents the setting of its own tag */
    ownTagMode?: ('Optional' | 'Required' | 'Forbidden')
}


export default function NoteEditor({
    notuRenderTools,
    note,
    tags,
    canSave = null,
    onSave,
    onCancel,
    ownTagMode = 'Optional'
}: NoteEditorProps) {

    if (!note.space)
        return (<Text style={s.text.plain}>Note must define the space that it belongs to</Text>);

    const [error, setError] = useState<string>(null);
    const textRef = useRef(null);
    const manualRefresh = useManualRefresh();

    const noteDateStr = `${note.date.toDateString()} ${note.date.getHours().toString().padStart(2, '0')}:${note.date.getMinutes().toString().padStart(2, '0')}`;

    async function submitNote(): Promise<void> {
        try {
            for (const nt of note.tags) {
                const ntd = notuRenderTools.getComponentFactoryForNoteTag(nt.tag, note);
                if (!!ntd) {
                    const ntdValidateResult = await ntd.validate(nt, note, notuRenderTools.notu);
                    if (!ntdValidateResult) {
                        setError(null);
                        return;
                    }
                }
            }
            const canSaveResult = await canSave(note);
            if (!!canSaveResult) {
                await notuRenderTools.notu.saveNotes([note]);
                try { onSave(note); } catch (err) { }
            }
            setError(null);
        }
        catch (err) {
            setError(err.message);
        }
    }

    function onTextChange(newValue: string): void {
        note.text = newValue;
        manualRefresh();
    }

    return (
        <View>
            <Text style={[s.text.plain, s.text.bold]}>{note.space.name}</Text>

            <Text style={[s.text.plain, s.text.italic]}>{noteDateStr}</Text>

            <TagEditor note={note} tags={tags} mode={ownTagMode}/>

            <Text style={[s.text.plain, s.text.bold]}>Text</Text>

            <TextInput value={note.text} multiline={true} onChangeText={onTextChange}/>

            <TouchableOpacity style={s.touch.button} onPress={submitNote}>
                <Text style={s.text.plain}>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}