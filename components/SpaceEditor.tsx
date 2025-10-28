import { NotuButton, NotuText } from "@/helpers/NotuStyles2";
import { Space } from "notu";
import { useState } from "react";
import { YStack } from "tamagui";
import { NotuRenderTools } from "../helpers/NotuRenderTools";

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
        <YStack>
            {!!error && (<NotuText bold danger>{error}</NotuText>)}

            <NotuText bold>{space.name}</NotuText>

            {!!componentFactory && componentFactory.getEditorComponent(space, notuRenderTools.notu)}
            
            <NotuButton onPress={saveSpace}>Submit</NotuButton>
        </YStack>
    )
}