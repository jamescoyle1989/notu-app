import { getNotu } from '@/helpers/NotuSetup';
import { Stack, useRouter } from 'expo-router';
import { Note } from "notu";
import { View } from 'tamagui';
import NoteEditor from '../../components/NoteEditor';


let _noteBeingEdited: Note;
export function setNoteBeingEdited(note: Note) {
    _noteBeingEdited = note;
}


export default function Index() {
    const renderTools = getNotu();
    const notu = renderTools.notu;
    const router = useRouter();

    return (
        <View flex={1} paddingInline={5} paddingBlock={5}>
            <Stack.Screen options={{
                title: 'Edit Note'
            }} />
            
            <NoteEditor notuRenderTools={renderTools}
                        note={_noteBeingEdited}
                        onSave={n => router.back()}/>
        </View>
    )
}