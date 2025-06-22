import { Overlay } from "@rneui/base";
import { Note, Tag } from "notu";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import ColorPicker, { ColorFormatsObject, HueCircular, Panel1 } from 'reanimated-color-picker';
import { getTextContrastColor } from "../helpers/ColorHelpers";
import { useManualRefresh } from "../helpers/Hooks";
import s from '../helpers/NotuStyles';


interface TagEditorProps {
    note: Note,
    /** The collection of tags that the note editor has access to */
    tags: Array<Tag>,
    /** Default mode is Optional, which allows the user to choose if they want to give a note its own tag. Required prevents saving unless the note has a tag, and forbidden prevents the setting of its own tag */
    mode?: ('Optional' | 'Required' | 'Forbidden')
}


export default function TagEditor({
    note,
    tags,
    mode
}: TagEditorProps) {

    if (mode == 'Forbidden')
        return;
    
    const manualRefresh = useManualRefresh();
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [showExistingTagColors, setShowExistingTagColors] = useState<boolean>(false);

    function onNameChange(newValue: string): void {
        if (newValue.length == 0)
            note.removeOwnTag();
        else
            note.setOwnTag(newValue);
        manualRefresh();
    }

    function onColorChange(color: ColorFormatsObject): void {
        note.ownTag.color = color.hex;
        manualRefresh();
    }

    function onCopyTagColor(tag: Tag): void {
        note.ownTag.color = tag.color;
        setShowExistingTagColors(false);
    }

    function toggleAvailability(): void {
        note.ownTag.availability = (note.ownTag.availability + 1) % 3;
        manualRefresh();
    }
    
    function renderOwnTagInput() {
        if (!note.ownTag || note.ownTag.isDeleted) {
            return (
                <TextInput value='' onChangeText={onNameChange}/>
            );
        }
        else {
            const availabilityText = note.ownTag.availability == 0
                ? 'Private'
                : (note.ownTag.availability == 1 ? 'Common' : 'Public');

            return (
                <View style={s.view.row}>
                    <TextInput value={note.ownTag.name} onChangeText={onNameChange}/>
                    <TouchableOpacity style={s.touch.button}
                                      onPress={toggleAvailability}>
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
                                         onCompleteJS={onColorChange}
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
                                                  onPress={() => onCopyTagColor(tag)}>
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
            <Text style={[s.text.plain, s.text.bold]}>Own Tag</Text>
            {renderOwnTagInput()}
        </View>
    );
}