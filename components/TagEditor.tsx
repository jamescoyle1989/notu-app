import { NotuButton, NotuInput, NotuText } from "@/helpers/NotuStyles";
import { ChevronDown } from '@tamagui/lucide-icons';
import { Note, Tag } from "notu";
import { useState } from "react";
import { Modal } from "react-native";
import ColorPicker, { ColorFormatsObject, HueCircular, Panel1 } from 'reanimated-color-picker';
import { Dialog, useTheme, View, XStack, YStack } from "tamagui";
import { getTextContrastColor } from "../helpers/ColorHelpers";
import { useManualRefresh } from "../helpers/Hooks";


interface TagEditorProps {
    note: Note,
    /** The collection of tags that the note editor has access to */
    tags: Array<Tag>
}


export default function TagEditor({
    note,
    tags
}: TagEditorProps) {

    const manualRefresh = useManualRefresh();
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [showExistingTagColors, setShowExistingTagColors] = useState<boolean>(false);
    const theme = useTheme();

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
    
    //This is all the stuff that gets rendered if the note actually has its own tag
    function renderOwnTagOptions() {

        return [
            <NotuButton key={2} joinedLeft joinedRight onPress={() => setShowColorPicker(true)}>
                Color
            </NotuButton>,
            
            <NotuButton key={3} joinedLeft onPress={() => setShowExistingTagColors(true)}>
                <ChevronDown />
            </NotuButton>,

            <Modal key={4}
                   onRequestClose={() => setShowColorPicker(false)}
                   visible={showColorPicker}
                   animationType="slide">
                <YStack bg="$background" flex={1}>
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
                    <NotuButton onPress={() => setShowColorPicker(false)}>
                        Confirm
                    </NotuButton>
                </YStack>
            </Modal>,

            <Dialog key={5} modal open={showExistingTagColors}>
                <Dialog.Portal>
                    <Dialog.Overlay key="tageditorexistingcolorsoverlay"
                                    onPress={() => setShowExistingTagColors(false)} />
                    <Dialog.FocusScope>
                        <Dialog.Content bordered elevate
                                        width="80%"
                                        key="tageditorexistingcolorscontent">
                            {tags.map((tag, index) => {
                                const backgroundColor = tag.color ?? '#AABBCC';
                                const textColor = getTextContrastColor(backgroundColor);
                                return (
                                    <NotuButton key={index}
                                                style={{backgroundColor, color: textColor}}
                                                onPress={() => onCopyTagColor(tag)}>
                                        {tag.name}
                                    </NotuButton> 
                                )
                            })}
                        </Dialog.Content>
                    </Dialog.FocusScope>
                </Dialog.Portal>
            </Dialog>
        ]
    }

    const showNoteOptions = !!note.ownTag && !note.ownTag.isDeleted;
    const backgroundColor = showNoteOptions 
        ? note.ownTag?.color ?? theme.background.val
        : theme.background.val;
    const textColor = getTextContrastColor(backgroundColor);
    
    return (
        <View>
            <NotuText bold marginTop={10}>Own Tag</NotuText>
            
            <XStack>
                <NotuInput value={showNoteOptions ? note.ownTag.name : ''}
                           onChangeText={onNameChange}
                           flex={1}
                           joinedRight={showNoteOptions}
                           backgroundColor={backgroundColor}
                           color={textColor} />

                {showNoteOptions && renderOwnTagOptions()}
            </XStack>
        </View>
    );
}