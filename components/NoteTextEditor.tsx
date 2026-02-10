import { NotuText } from "@/helpers/NotuStyles";
import { Note } from "notu";
import { NoteComponentProcessor } from "notu/dist/types/notecomponents/NoteComponent";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { Keyboard } from "react-native";
import { Input, View, XStack, YStack } from "tamagui";
import { useManualRefresh } from "../helpers/Hooks";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import { NoteComponentContainer } from "./NoteComponentContainer";
import { NotuCustomSelect } from "./NotuCustomSelect";

interface NoteTextEditorProps {
    notuRenderTools: NotuRenderTools,
    note: Note,
    readonly?: boolean,
    onTextChange?: () => void
}

export interface NoteTextEditorCommands {
    updateNote: () => void
}


export const NoteTextEditor = React.forwardRef((
    {
        notuRenderTools,
        note,
        readonly = false,
        onTextChange
    }: NoteTextEditorProps,
    ref: React.ForwardedRef<NoteTextEditorCommands>
) => {
    const manualRefresh = useManualRefresh();
    const [selectedTextRange, setSelectedTextRange] = useState({start: note.text.length, end: note.text.length});
    const [textComponents, setTextComponents] = useState<any[]>(null);
    const [showNoteComponentsSelect, setShowNoteComponentsSelect] = useState(false);
    const [mode, setMode] = useState<'Raw' | 'Components'>('Raw');

    useImperativeHandle(ref, () => ({
        updateNote: () => {
            if (mode == 'Components')
                note.text = textComponents.map(x => x.getText()).join('');
        }
    }));

    useEffect(() => {
        if (mode == 'Components' && textComponents == null)
            setTextComponents(notuRenderTools.noteTextSplitter(note, true));
        else if (mode == 'Raw' && textComponents != null) {
            note.text = textComponents.map(x => x.getText()).join('');
            setTextComponents(null);
        }
    }, [mode]);

    function toggleMode(): void {
        if (mode == 'Raw')
            setMode('Components')
        else
            setMode('Raw');
    }

    function handleTextChange(newValue: string): void {
        note.text = newValue;
        if (!!onTextChange)
            onTextChange();
        manualRefresh();
    }

    function handleAddTextComponentPress(): void {
        Keyboard.dismiss();
        setShowNoteComponentsSelect(true);
    }

    function handleNoteComponentSelectValueChange(value): void {
        addComponentToNoteText(value);
        setShowNoteComponentsSelect(false);
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

    function renderRawView() {
        return (
            <Input value={note.text}
                   multiline={true}
                   disabled={readonly}
                   onChangeText={handleTextChange}
                   onSelectionChange={e => {
                        const selection = e.nativeEvent.selection;
                        setSelectedTextRange({start: selection.start, end: selection.end});
                   }}/>
        );
    }

    let colorIndex = 0;
    const colors = [
        '#9DCF62',
        '#E6EB81',
        '#F69B43',
        '#8F70DC',
        '#F897BB',
        '#14B2B4'
    ]
    function cycleColors(): string {
        const output = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
        return output;
    }

    function renderComponentsView() {
        if (textComponents == null)
            return;
        return (
            <View marginBlockStart={10}>
                {textComponents.map((x, index) => (
                    <NoteComponentContainer key={index} component={x} editMode={true} color={cycleColors}/>
                ))}
            </View>
        );
    }

    return (
        <YStack>
            <XStack marginBlockStart={10}>
                <NotuText bold>Text </NotuText>
                {!readonly && (
                    <NotuText pressable onPress={() => toggleMode()}>
                        {`${mode} View`}
                    </NotuText>
                )}
                {!readonly && mode == 'Raw' && (
                    <NotuText marginLeft={10} pressable onPress={() => handleAddTextComponentPress()}>
                        Add Text Component
                    </NotuText>
                )}
            </XStack>
            {mode == 'Raw' && renderRawView()}
            {mode == 'Components' && renderComponentsView()}

            <NotuCustomSelect options={getComponentsDropdownData()}
                              onValueChange={handleNoteComponentSelectValueChange}
                              open={showNoteComponentsSelect} />
        </YStack>
    );
});