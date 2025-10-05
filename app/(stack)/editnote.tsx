import { getNotu } from '@/helpers/NotuSetup';
import { useRouter } from 'expo-router';
import { Note } from "notu";
import { View } from "react-native";
import NoteEditor from '../../components/NoteEditor';
import s from '../../helpers/NotuStyles';


let _noteBeingEdited: Note;
export function setNoteBeingEdited(note: Note) {
    _noteBeingEdited = note;
}


export default function Index() {
    const renderTools = getNotu();
    const notu = renderTools.notu;
    const router = useRouter();

    return (
        <View style={s.container.background}>
            <NoteEditor notuRenderTools={renderTools}
                        note={_noteBeingEdited}
                        canSave={n => Promise.resolve(true)}
                        onSave={n => router.back()}
                        onCancel={n => router.back()}/>
        </View>
    )
}