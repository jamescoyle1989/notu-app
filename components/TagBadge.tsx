import { NotuText } from '@/helpers/NotuStyles';
import { X } from '@tamagui/lucide-icons';
import { Space, Tag } from 'notu';
import { View, ViewProps } from 'tamagui';
import { getTextContrastColor } from '../helpers/ColorHelpers';
import { NotuRenderTools } from '../helpers/NotuRenderTools';

interface TagBadgeProps {
    tag: Tag,
    notuRenderTools: NotuRenderTools,
    contextSpace: Space,
    onDelete?: () => void,
    useUniqueName?: boolean
}


export default function TagBadge(
    props: TagBadgeProps & Omit<ViewProps, "tag">
) {
    
    const tagDisplayName = props.useUniqueName 
        ? props.tag.getUniqueName(props.notuRenderTools.notu.cache) 
        : props.tag.getQualifiedName(props.contextSpace.id);

    const backgroundColor = props.tag.color ?? '#AABBCC';
    const textColor = getTextContrastColor(backgroundColor);
    
    return (
        <View {...props as any}
            borderColor="$borderColor"
            style={{
                backgroundColor: backgroundColor,
                paddingHorizontal: 5,
                borderRadius: 50,
                borderWidth: 0.5,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
            <NotuText color={textColor} bold small>{tagDisplayName}</NotuText>
            {!!props.onDelete && (
                <X size={17} color="red" onPress={() => props.onDelete()} />
            )}
        </View>
    );
}