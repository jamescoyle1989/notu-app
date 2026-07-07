import { PasswordForm } from '@/components/PasswordForm';
import { ShowEditorAction } from '@/helpers/NoteAction';
import { getNotu } from '@/helpers/NotuSetup';
import { getPasswordCache } from '@/helpers/PasswordCache';
import { PasswordProtectionData } from '@/spaces/system/PasswordProtectionNoteTagData';
import { SystemSpace } from '@/spaces/system/SystemSpace';
import { Stack, useRouter } from 'expo-router';
import { Note } from 'notu';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native';
import { Dialog, View } from 'tamagui';
import NoteEditor from '../../components/NoteEditor';


let _action: ShowEditorAction;
export function setNoteBeingEdited(action: ShowEditorAction) {
    _action = action;
}


class EditNotePagePasswordPromptData {
    passwordNoteId: number;
    passwordProtectionData: PasswordProtectionData;
    forNoteId: number;

    constructor(
        passwordNoteId: number,
        passwordProtectionData: PasswordProtectionData,
        forNoteId: number
    ) {
        this.passwordNoteId = passwordNoteId;
        this.passwordProtectionData = passwordProtectionData;
        this.forNoteId = forNoteId;
    }
}


export default function Index() {
    const renderTools = getNotu();
    const notu = renderTools.notu;
    const router = useRouter();
    const [passwordPromptData, setPasswordPromptData] = useState<EditNotePagePasswordPromptData>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function showPasswordFormIfNecessary(): Promise<boolean> {
        const systemSpace = new SystemSpace(notu);
        const passwordNT = _action.note.tags.find(x => x.tag.linksTo(systemSpace.passwordProtection));
        if (!passwordNT)
            return false;

        const passwordCache = getPasswordCache();
        if (!!passwordCache.get(passwordNT.tag.id, _action.note.id))
            return false;

        const passwordNote = (await notu.getNotes(`n.id = ${passwordNT.tag.id}`))[0];
        const passwordData = passwordNote.getTagData(systemSpace.passwordProtection, PasswordProtectionData);

        setPasswordPromptData(new EditNotePagePasswordPromptData(
            passwordNT.tag.id,
            passwordData,
            _action.note.id
        ));
        return true;
    }

    useEffect(() => {
        showPasswordFormIfNecessary();
    }, []);

    async function handleSave(note: Note) {
        setIsSubmitting(true);
        if (await showPasswordFormIfNecessary())
            return;

        await saveAndReturn(note);
    }

    async function saveAndReturn(note: Note) {
        await renderTools.notu.saveNotes([note]);
        router.back();
    }

    function handlePasswordBackgroundPress() {
        if (isSubmitting) {
            setPasswordPromptData(null);
            setIsSubmitting(false);
        }
        else {
            router.back();
        }
    }

    async function handlePasswordSubmit() {
        if (isSubmitting)
            await saveAndReturn(_action.note);
        else
            setPasswordPromptData(null);
    }

    return (
        <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
            <View flex={1} paddingInline={5} paddingBlock={5}>
                <Stack.Screen options={{
                    title: 'Edit Note'
                }} />
                
                <NoteEditor notuRenderTools={renderTools}
                            note={_action.note}
                            onSave={handleSave}
                            canEditSpace={_action.canEditSpace}
                            canEditOwnTag={_action.canEditOwnTag}
                            canEditText={_action.canEditText}
                            canEditTags={_action.canEditTags} />

                <Dialog modal open={!!passwordPromptData}>
                    <Dialog.Portal>
                        <Dialog.Overlay key="editnotepageoverlay" onPress={handlePasswordBackgroundPress} />
                        <Dialog.FocusScope>
                            <Dialog.Content bordered elevate
                                            width="80%"
                                            key="editnotepageoverlaycontent">
                                {!!passwordPromptData && (
                                    <PasswordForm passwordNoteId={passwordPromptData.passwordNoteId}
                                                  passwordProtectionData={passwordPromptData.passwordProtectionData}
                                                  forNoteId={passwordPromptData.forNoteId}
                                                  submitCallback={handlePasswordSubmit} />
                                )}
                            </Dialog.Content>
                        </Dialog.FocusScope>
                    </Dialog.Portal>
                </Dialog>
            </View>
        </KeyboardAvoidingView>
    )
}