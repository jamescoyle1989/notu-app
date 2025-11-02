import { Note } from "notu";
import { NoteComponentProcessor } from "notu/dist/types/notecomponents/NoteComponent";
import { useEffect, useState } from "react";
import { Input, View } from "tamagui";
import { useManualRefresh } from "../helpers/Hooks";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import { NoteComponentContainer } from "./NoteComponentContainer";
import { NotuSelect } from "./NotuSelect";

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
    const [selectedTextRange, setSelectedTextRange] = useState({start: note.text.length, end: note.text.length});
    const [textComponents, setTextComponents] = useState<any[]>(null);

    useEffect(() => {
        if (mode == 'Components' && textComponents == null)
            setTextComponents(notuRenderTools.noteTextSplitter(note, true));
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

    function getComponentsDropdownData(): Array<{name: string, value: NoteComponentProcessor}> {
        return notuRenderTools.noteComponentProcessors.map(x => ({
            name: x.displayName,
            value: x
        }));
    }

    function addComponentToNoteText(processor: NoteComponentProcessor): void {
        note.text = note.text.substring(0, selectedTextRange.start)
                  + processor.newComponentText(note.text.substring(selectedTextRange.start, selectedTextRange.end))
                  + note.text.substring(selectedTextRange.end);
        manualRefresh();
    }

    if (mode == 'Raw') {
        const componentsDropdownData = getComponentsDropdownData();
        return (
            <View>
                <Input value={note.text}
                       multiline={true}
                       onChangeText={handleTextChange}
                       onSelectionChange={e => {
                            const selection = e.nativeEvent.selection;
                            setSelectedTextRange({start: selection.start, end: selection.end});
                       }}/>
            
                {componentsDropdownData.length > 0 && (
                    <NotuSelect options={componentsDropdownData}
                                value={null}
                                placeholderText="Add Text Component..."
                                onValueChange={value => addComponentToNoteText(value)} />
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