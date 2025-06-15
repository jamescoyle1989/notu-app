import { Overlay } from "@rneui/base";
import { Note, Tag } from "notu";
import { useRef, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import ColorPicker, { ColorFormatsObject, HueCircular, Panel1 } from 'reanimated-color-picker';
import { getTextContrastColor } from "../helpers/ColorHelpers";
import { useManualRefresh } from "../helpers/Hooks";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';

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
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [showExistingTagColors, setShowExistingTagColors] = useState<boolean>(false);
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

    function onOwnTagNameChange(newValue: string): void {
        if (newValue.length == 0)
            note.removeOwnTag();
        else
            note.setOwnTag(newValue);
        manualRefresh();
    }

    function onOwnTagColorChange(color: ColorFormatsObject): void {
        note.ownTag.color = color.hex;
        manualRefresh();
    }

    function onCopyTagColorToOwnTag(tag: Tag): void {
        note.ownTag.color = tag.color;
        setShowExistingTagColors(false);
    }

    function toggleOwnTagAvailability(): void {
        note.ownTag.availability = (note.ownTag.availability + 1) % 3;
        manualRefresh();
    }

    function onTextChange(newValue: string): void {
        note.text = newValue;
        manualRefresh();
    }

    function renderOwnTag() {
        if (ownTagMode == 'Forbidden')
            return;

        let value = note.ownTag?.name ?? '';
        if (note.ownTag?.isDeleted)
            value = '';

        return (
            <View>
                <Text style={[s.text.plain, s.text.bold]}>Own Tag</Text>
                {renderOwnTagInput()}
            </View>
        )
    }

    function renderOwnTagInput() {
        if (!note.ownTag || note.ownTag.isDeleted) {
            return (
                <TextInput value='' onChangeText={onOwnTagNameChange}/>
            );
        }
        else {
            const availabilityText = note.ownTag.availability == 0
                ? 'Private'
                : (note.ownTag.availability == 1 ? 'Common' : 'Public');

            return (
                <View style={s.view.row}>
                    <TextInput value={note.ownTag.name} onChangeText={onOwnTagNameChange}/>
                    <TouchableOpacity style={s.touch.button}
                                      onPress={toggleOwnTagAvailability}>
                        <Text style={s.text.plain}>{availabilityText}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.touch.button}
                                      onPress={() => setShowColorPicker(true)}>
                        <Text style={s.text.plain}>Color</Text>
                    </TouchableOpacity>
                    <Modal onRequestClose={() => setShowColorPicker(false)}
                           visible={showColorPicker}
                           animationType="slide">
                        <View style={[s.view.background]}>
                            <ColorPicker value={note.ownTag.color ?? '#AABBCC'}
                                         sliderThickness={20}
                                         thumbSize={24}
                                         onCompleteJS={onOwnTagColorChange}
                                         boundedThumb>
                                <HueCircular containerStyle={{justifyContent: 'center'}}
                                             thumbShape="pill">
                                    <Panel1 style={{borderRadius: 16, width: '70%', height: '70%', alignSelf: 'center'}} />
                                </HueCircular>
                            </ColorPicker>
                            <TouchableOpacity style={s.touch.button}
                                              onPress={() => setShowColorPicker(false)}>
                                <Text style={s.text.plain}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    <TouchableOpacity style={s.touch.button}
                                      onPress={() => setShowExistingTagColors(true)}>
                        <Text style={s.text.plain}>Predefined</Text>
                    </TouchableOpacity>
                    <Overlay isVisible={showExistingTagColors} onBackdropPress={() => setShowExistingTagColors(false)}>
                        {tags.map((tag, index) => {
                            const backgroundColor = tag.color ?? '#AABBCC';
                            const textColor = getTextContrastColor(backgroundColor);
                            return (
                                <TouchableOpacity key={index}
                                                  style={{backgroundColor, padding: 7}}
                                                  onPress={() => onCopyTagColorToOwnTag(tag)}>
                                    <Text style={{color: textColor}}>{tag.name}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </Overlay>
                </View>
            )
        }
    }

    return (
        <View>
            <Text style={[s.text.plain, s.text.bold]}>{note.space.name}</Text>

            <Text style={[s.text.plain, s.text.italic]}>{noteDateStr}</Text>

            {renderOwnTag()}

            <Text style={[s.text.plain, s.text.bold]}>Text</Text>

            <TextInput value={note.text} multiline={true} onChangeText={onTextChange}/>

            <TouchableOpacity style={s.touch.button} onPress={submitNote}>
                <Text style={s.text.plain}>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}