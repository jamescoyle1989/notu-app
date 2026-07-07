import { NotuInput } from "@/helpers/NotuStyles";
import { getPasswordCache } from "@/helpers/PasswordCache";
import { PasswordProtectionData } from "@/spaces/system/PasswordProtectionNoteTagData";
import { useState } from "react";
import { Button, Label, XStack, YStack } from "tamagui";

interface PasswordFormProps {
    passwordNoteId: number,
    passwordProtectionData: PasswordProtectionData,
    forNoteId: number | null,
    submitCallback: (password: string) => void
}


export const PasswordForm = ({
    passwordNoteId,
    passwordProtectionData,
    forNoteId,
    submitCallback
}: PasswordFormProps) => {

    const [password, setPassword] = useState('');
    const labelWidth = 120;

    function handlePasswordChange(value: string) {
        setPassword(value);
    }

    function handleSubmit() {
        if (!passwordProtectionData.validatePassword(password)) {
            setPassword('');
            return;
        }
        const passwordCache = getPasswordCache();
        passwordCache.add(password, passwordNoteId, passwordProtectionData, forNoteId);
        submitCallback(password);
    }

    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Password</Label>
                <NotuInput value={password} flex={1}
                        onChangeText={handlePasswordChange} />
            </XStack>

            <Button theme="highlight"
                    marginBlockStart={10}
                    onPress={handleSubmit}>
                Submit
            </Button>
        </YStack>
    );
}