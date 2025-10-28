import { NotuText } from '@/helpers/NotuStyles2';
import { X } from '@tamagui/lucide-icons';
import { Note, NoteTag, Space } from 'notu';
import { ReactNode } from 'react';
import { View } from 'tamagui';
import { getTextContrastColor } from '../helpers/ColorHelpers';
import { NotuRenderTools } from '../helpers/NotuRenderTools';

interface NoteTagBadgeProps {
    noteTag: NoteTag,
    note: Note,
    notuRenderTools: NotuRenderTools,
    contextSpace: Space,
    onDelete?: () => void,
    useUniqueName?: boolean
}


export default function NoteTagBadge({
    noteTag,
    note,
    notuRenderTools,
    contextSpace,
    onDelete = undefined,
    useUniqueName = false
}: NoteTagBadgeProps) {
    
    const tagDisplayName = useUniqueName 
        ? noteTag.tag.getUniqueName(notuRenderTools.notu.cache) 
        : noteTag.tag.getQualifiedName(contextSpace.id);

    const backgroundColor = noteTag.tag.color ?? '#AABBCC';
    const textColor = getTextContrastColor(backgroundColor);

    function renderNoteTagData(): ReactNode {
        const dataComponent = notuRenderTools.getComponentFactoryForNoteTag(noteTag.tag, note);
        if (!dataComponent)
            return;
        return dataComponent.getBadgeComponent(noteTag, note, notuRenderTools.notu);
    }
    
    return (
        <View style={{
              backgroundColor: backgroundColor,
              paddingHorizontal: 5,
              borderRadius: 50,
              borderWidth: 1,
              flexDirection: 'row',
              alignItems: 'center'
        }}>
            <NotuText color={textColor}>
                {tagDisplayName}
            </NotuText>
            {renderNoteTagData()}
            {!!onDelete && (
                <X size={17} color="red" onPress={() => onDelete()} />
            )}
        </View>
    );
}