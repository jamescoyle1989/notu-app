import { NotuText } from '@/helpers/NotuStyles';
import { X } from '@tamagui/lucide-icons';
import { Note, NoteTag, Space } from 'notu';
import { View, ViewProps } from 'tamagui';
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


export default function NoteTagBadge(props: NoteTagBadgeProps & ViewProps) {
    
    const tagDisplayName = props.useUniqueName 
        ? props.noteTag.tag.getUniqueName(props.notuRenderTools.notu.cache) 
        : props.noteTag.tag.getQualifiedName(props.contextSpace.id);

    const backgroundColor = props.noteTag.tag.color ?? '#AABBCC';
    const textColor = getTextContrastColor(backgroundColor);

    const componentFactory = props.notuRenderTools.getComponentFactoryForNoteTag(props.noteTag.tag, props.note);
    const badgeComponent = componentFactory?.getBadgeComponent(props.noteTag, props.note, props.notuRenderTools.notu, textColor);
    
    return (
        <View {...props}
            borderColor="$borderColor"
            style={{
                backgroundColor: backgroundColor,
                paddingHorizontal: 5,
                borderRadius: 50,
                borderWidth: 0.5,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
            
            <NotuText color={textColor} bold small marginInlineEnd={!!badgeComponent ? 2 : 0}>
                {tagDisplayName}
            </NotuText>
            {badgeComponent}
            {!!props.onDelete && (
                <X size={17} color="red" onPress={() => props.onDelete()} />
            )}
        </View>
    );
}