import { Note } from "notu";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
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
    const [componentsDropdownFocused, setComponentsDropdownFocused] = useState(false);
    const [selectedTextRange, setSelectedTextRange] = useState({start: note.text.length - 1, end: note.text.length - 1});

    function handleTextChange(newValue: string): void {
        note.text = newValue;
        if (!!onTextChange)
            onTextChange();
        manualRefresh();
    }

    function getComponentsDropdownData(): Array<{label: string, value: number}> {
        return notuRenderTools.noteComponentProcessors.map((x, index) => ({
            label: x.displayName,
            value: index
        }));
    }

    function addComponentToNoteText(processorIndex: number): void {
        const processor = notuRenderTools.noteComponentProcessors[processorIndex];
        note.text = note.text.substring(0, selectedTextRange.start)
                  + processor.newComponentText(note.text.substring(selectedTextRange.start, selectedTextRange.end))
                  + note.text.substring(selectedTextRange.end);
        manualRefresh();
    }

    const componentsDropdownData = getComponentsDropdownData();

    return (
        <View>
            <TextInput value={note.text}
                       multiline={true}
                       onChangeText={handleTextChange}
                       onSelectionChange={e => {
                            const selection = e.nativeEvent.selection;
                            setSelectedTextRange({start: selection.start, end: selection.end});
                       }}
                       style={[s.border.main, s.text.plain]}/>
        
            {componentsDropdownData.length > 0 && (
                <Dropdown style={[s.dropdown.main, s.border.main, componentsDropdownFocused && s.dropdown.focused]}
                          placeholderStyle={s.dropdown.placeholder}
                          selectedTextStyle={s.dropdown.selected}
                          data={componentsDropdownData}
                          maxHeight={300}
                          labelField='label'
                          valueField='value'
                          value={null}
                          onFocus={() => setComponentsDropdownFocused(true)}
                          onBlur={() => setComponentsDropdownFocused(false)}
                          onChange={item => {
                            addComponentToNoteText(item.value);
                            setComponentsDropdownFocused(false);
                          }}/>
            )}
        </View>
    );
}