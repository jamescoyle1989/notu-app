import { Space } from "notu";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';

interface SpaceEditorProps {
    notuRenderTools: NotuRenderTools,
    space: Space
}


export default function SpaceEditor({
    notuRenderTools,
    space
}: SpaceEditorProps) {

    const [error, setError] = useState<string>(null);
    const componentFactory = notuRenderTools.getSettingsComponentFactoryForSpace(space);
    
    async function saveSpace(): Promise<void> {
        try {
            if (!!componentFactory) {
                const validateResult = await componentFactory.validate(space, notuRenderTools.notu);
                if (!validateResult) {
                    setError(null);
                    return;
                }
            }
            await notuRenderTools.notu.saveSpace(space);
            setError(null);
        }
        catch (err) {
            setError(err.message);
        }
    }

    return (
        <View>
            {!!error && (<Text style={[s.text.danger, s.text.bold]}>{error}</Text>)}

            <Text style={[s.text.plain, s.text.bold]}>{space.name}</Text>

            {!!componentFactory && componentFactory.getEditorComponent(space, notuRenderTools.notu)}
            
            <TouchableOpacity style={s.touch.button} onPress={saveSpace}>
                <Text style={s.text.plain}>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}