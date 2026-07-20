import { TimespanPicker } from "@/components/TimeSpanPicker";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode, useState } from "react";
import { Label, XStack, YStack } from "tamagui";
import { PasswordProtectionData } from "./PasswordProtectionNoteTagData";
import defs from "./SystemSpaceDefs";

export default class PasswordProtectionNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        const data = new PasswordProtectionData(noteTag);
        if (!data.passwordHash)
            throw Error('No password has been set');
        if (!note.ownTag)
            throw Error(`The 'Password Protection' tag requires that the note define its own tag.`);
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag, note: Note) {
        return new PasswordProtectionData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == defs.internalName &&
            tag.name == defs.passwordProtection;
    }
}


function EditorComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new PasswordProtectionData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const isPasswordGood = noteTag.isNew
        ? password == confirmPassword
        : password.length > 0 && data.calculateHash(password) == data.passwordHash;

    function onPasswordChange(value: string) {
        setPassword(value);
        if (value.length > 0 && value == confirmPassword)
            updatePasswordHash(value);
        else
            clearPasswordHash();
    }

    function onConfirmPasswordChange(value: string) {
        setConfirmPassword(value);
        if (value.length > 0 && value == password)
            updatePasswordHash(value);
        else
            clearPasswordHash();
    }

    function updatePasswordHash(password: string) {
        data.passwordHash = data.calculateHash(password);
        manualRefresh();
    }

    function clearPasswordHash() {
        data.passwordHash = '';
        manualRefresh();
    }

    function onTestPasswordChange(value: string) {
        setPassword(value);
    }

    function onCacheDurationChange(value: number) {
        data.cacheDurationMs = value;
        manualRefresh();
    }

    return (
        <YStack>
            {noteTag.isNew && (
                <YStack>
                    <XStack style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>Password</Label>
                        <NotuInput value={password} flex={1}
                                   secureTextEntry={true}
                                   onChangeText={onPasswordChange}
                                   success={isPasswordGood} />
                    </XStack>

                    <XStack style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>Confirm</Label>
                        <NotuInput value={confirmPassword} flex={1}
                                   secureTextEntry={true}
                                   onChangeText={onConfirmPasswordChange}
                                   success={isPasswordGood} />
                    </XStack>
                </YStack>
            )}
            {!noteTag.isNew && (
                <XStack style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>Test Password</Label>
                    <NotuInput value={password} flex={1}
                               secureTextEntry={true}
                               onChangeText={onTestPasswordChange}
                               success={isPasswordGood} />
                </XStack>
            )}

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Cache Duration</Label>
                <TimespanPicker milliseconds={data.cacheDurationMs}
                                onChange={onCacheDurationChange} />
            </XStack>
        </YStack>
    );
}