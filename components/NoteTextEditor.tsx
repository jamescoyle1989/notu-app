import { Note } from "notu";
import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useManualRefresh } from "../helpers/Hooks";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';
import { NoteComponentContainer } from "./NoteComponentContainer";

interface NoteTextEditorProps {
    notuRenderTools: NotuRenderTools,
    note: Note,
    onTextChange?: () => void,
    mode: 'Raw' | 'Components'
}


export default function NoteTextEditor({
    notuRenderTools,
    note,
    onTextChange = null,
    mode
}: NoteTextEditorProps) {
    
    const manualRefresh = useManualRefresh();
    const [componentsDropdownFocused, setComponentsDropdownFocused] = useState(false);
    const [selectedTextRange, setSelectedTextRange] = useState({start: note.text.length, end: note.text.length});
    const [textComponents, setTextComponents] = useState<any[]>(null);

    useEffect(() => {
        if (mode == 'Components' && textComponents == null)
            setTextComponents(notuRenderTools.noteTextSplitter(note));
        else if (mode == 'Raw' && textComponents != null) {
            note.text = textComponents.map(x => x.getText()).join('');
            setTextComponents(null);
        }
    }, [mode]);

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

    if (mode == 'Raw') {
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
    else if (mode == 'Components' && textComponents != null) {
        return (
            <View>
                {textComponents.map((x, index) => (
                    <NoteComponentContainer key={index} component={x} editMode={true}/>
                ))}
            </View>
        );
    }
}