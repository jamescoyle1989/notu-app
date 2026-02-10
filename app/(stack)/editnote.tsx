import { ShowEditorAction } from '@/helpers/NoteAction';
import { getNotu } from '@/helpers/NotuSetup';
import { Stack, useRouter } from 'expo-router';
import { KeyboardAvoidingView } from 'react-native';
import { View } from 'tamagui';
import NoteEditor from '../../components/NoteEditor';


let _action: ShowEditorAction;
export function setNoteBeingEdited(action: ShowEditorAction) {
    _action = action;
}


export default function Index() {
    const renderTools = getNotu();
    const notu = renderTools.notu;
    const router = useRouter();

    return (
        <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
            <View flex={1} paddingInline={5} paddingBlock={5}>
                <Stack.Screen options={{
                    title: 'Edit Note'
                }} />
                
                <NoteEditor notuRenderTools={renderTools}
                            note={_action.note}
                            onSave={n => router.back()}
                            canEditSpace={_action.canEditSpace}
                            canEditOwnTag={_action.canEditOwnTag}
                            canEditText={_action.canEditText}
                            canEditTags={_action.canEditTags} />
            </View>
        </KeyboardAvoidingView>
    )
}