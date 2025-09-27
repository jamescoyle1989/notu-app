import { getNotu } from '@/helpers/NotuSetup';
import { Note } from "notu";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import NoteEditor from '../components/NoteEditor';
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';


export default function Index() {
    
    const [renderTools, setRenderTools] = useState<NotuRenderTools>(null);

    useEffect(() => {
        async function load() {
            setRenderTools(await getNotu());
        }
        load();
    }, []);

    if (renderTools == null) {
        return (
            <View style={s.container.background}>
                <Text>Loading Index...</Text>
            </View>
        );
    }
    const notu = renderTools.notu;

    function renderNoteEditor() {
        const note = new Note('Test note').in(notu.getSpaceByName('Common'));

        return (
            <NoteEditor notuRenderTools={renderTools}
                        note={note}
                        tags={notu.getTags()}
                        canSave={n => Promise.resolve(false)}
                        onSave={n => {}}
                        onCancel={n => {}}/>
        )
    }

    return (
        <View style={s.container.background}>
            {renderNoteEditor()}
        </View>
    )
}