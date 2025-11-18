import { NotuText } from '@/helpers/NotuStyles';
import { X } from '@tamagui/lucide-icons';
import { Space, Tag } from 'notu';
import { View } from 'tamagui';
import { getTextContrastColor } from '../helpers/ColorHelpers';
import { NotuRenderTools } from '../helpers/NotuRenderTools';

interface TagBadgeProps {
    tag: Tag,
    notuRenderTools: NotuRenderTools,
    contextSpace: Space,
    onDelete?: () => void,
    useUniqueName?: boolean
}


export default function TagBadge({
    tag,
    notuRenderTools,
    contextSpace,
    onDelete = undefined,
    useUniqueName
}: TagBadgeProps) {
    
    const tagDisplayName = useUniqueName 
        ? tag.getUniqueName(notuRenderTools.notu.cache) 
        : tag.getQualifiedName(contextSpace.id);

    const backgroundColor = tag.color ?? '#AABBCC';
    const textColor = getTextContrastColor(backgroundColor);
    
    return (
        <View style={{
                backgroundColor: backgroundColor,
                paddingHorizontal: 5,
                borderRadius: 50,
                borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center'
            }}>
            <NotuText color={textColor} bold>{tagDisplayName}</NotuText>
            {!!onDelete && (
                <X size={17} color="red" onPress={() => onDelete()} />
            )}
        </View>
    );
}