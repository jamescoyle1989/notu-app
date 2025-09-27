import Ionicons from '@expo/vector-icons/Ionicons';
import { Space, Tag } from 'notu';
import { Text, TouchableOpacity, View } from "react-native";
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
            <Text style={{ color: textColor }}>{tagDisplayName}</Text>
            {!!onDelete && (
                <TouchableOpacity>
                    <Ionicons name='remove-circle-outline' size={18} color={textColor} />
                </TouchableOpacity>
            )}
        </View>
    );
}