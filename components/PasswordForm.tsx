import { useManualRefresh } from "@/helpers/Hooks";
import { NotuInput } from "@/helpers/NotuStyles";
import { getPasswordCache } from "@/helpers/PasswordCache";
import { PasswordProtectionData } from "@/spaces/system/PasswordProtectionNoteTagData";
import { Tag } from "notu";
import { useState } from "react";
import { Button, Label, XStack, YStack } from "tamagui";

interface PasswordFormProps {
    data: Array<PasswordEnforcement>,
    submitCallback: () => void
}

export class PasswordEnforcement {
    private _passwordTag: Tag;
    get passwordTag(): Tag { return this._passwordTag; }

    private _passwordProtectionData: PasswordProtectionData;
    get passwordProtectionData(): PasswordProtectionData { return this._passwordProtectionData; }

    private _forNoteIds: null | Array<number>;
    get forNoteIds(): null | Array<number> { return this._forNoteIds; }

    constructor(
        passwordTag: Tag,
        passwordProtectionData: PasswordProtectionData,
        forNoteIds: null | Array<number>
    ) {
        this._passwordTag = passwordTag;
        this._passwordProtectionData = passwordProtectionData;
        this._forNoteIds = forNoteIds;
    }
}


export const PasswordForm = ({
    data,
    submitCallback
}: PasswordFormProps) => {

    const [passwords, setPasswords] = useState(data.map(x => ''));
    const manualRefresh = useManualRefresh();
    const labelWidth = 180;

    function handlePasswordChange(index: number, value: string) {
        passwords[index] = value;
        setPasswords(passwords);
        manualRefresh();
    }

    function handleSubmit() {
        let anyFailed = false;
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            if (!d.passwordProtectionData.validatePassword(passwords[i])) {
                anyFailed = true;
                passwords[i] = '';
            }
        }
        if (anyFailed) {
            setPasswords(passwords);
            manualRefresh();
            return;
        }
        const passwordCache = getPasswordCache();
        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            if (d.forNoteIds == null)
                passwordCache.add(passwords[i], d.passwordTag.id, d.passwordProtectionData, null)
            else {
                for (const noteId of d.forNoteIds)
                    passwordCache.add(passwords[i], d.passwordTag.id, d.passwordProtectionData, noteId);
            }
        }
        submitCallback();
    }

    return (
        <YStack>
            {data.map((d, i) => (
                <XStack key={i} style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>{d.passwordTag.name} Password</Label>
                    <NotuInput value={passwords[i]} flex={1}
                               secureTextEntry={true}
                               onChangeText={value => handlePasswordChange(i, value)} />
                </XStack>
            ))}

            <Button theme="highlight"
                    marginBlockStart={10}
                    onPress={handleSubmit}>
                Submit
            </Button>
        </YStack>
    );
}