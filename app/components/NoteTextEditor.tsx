import { Note } from "notu";
import { TextInput } from "react-native";
import { useManualRefresh } from "../helpers/Hooks";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';

interface NoteTextEditorProps {
    notuRenderTools: NotuRenderTools,
    note: Note,
    onTextChange?: () => void
}


export default function NoteTextEditor({
    notuRenderTools,
    note,
    onTextChange = null
}: NoteTextEditorProps) {
    
    const manualRefresh = useManualRefresh();

    function handleTextChange(newValue: string): void {
        note.text = newValue;
        if (!!onTextChange)
            onTextChange();
        manualRefresh();
    }

    return (
        <TextInput value={note.text}
                   multiline={true}
                   onChangeText={handleTextChange}
                   style={[s.border.main, s.text.plain]}/>
    );
}