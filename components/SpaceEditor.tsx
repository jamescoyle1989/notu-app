import { NotuButton, NotuText } from "@/helpers/NotuStyles";
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
    
    async function saveSpace(): Promise<void> {
        try {
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
            
            <NotuButton onPress={saveSpace}>Submit</NotuButton>
        </YStack>
    )
}