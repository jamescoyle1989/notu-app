import { Link } from "expo-router";
import { Note, NoteTag, Notu, NotuCache, NotuHttpClient, Space, Tag } from "notu";
import { ReactNode, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import NoteTagBadge from "../components/NoteTagBadge";
import TagBadge from "../components/TagBadge";
import { getTextContrastColor } from "../helpers/ColorHelpers";
import { NoteTagDataComponentFactory, NotuRenderTools } from "../helpers/NotuRenderTools";


class TestNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode {
        const backgroundColor = noteTag.tag.color ?? '#AABBCC';
        const textColor = getTextContrastColor(backgroundColor);

        return (
            <View>
                <Text style={{ color: textColor }}>Hi, this is cool</Text>
            </View>
        );
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (
            <View>
                <Text>Even cooler!</Text>
            </View>
        );
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}

const renderTools = new NotuRenderTools(
    new Notu(
        new NotuHttpClient('asdf'),
        new NotuCache({
            getSpacesData() {
                return Promise.resolve([]);
            },
            getTagsData() {
                return Promise.resolve([]);
            }
        })
    ),
    (tag: Tag, note: Note) => {
        if (tag.name == 'Test tag')
            return new TestNoteTagDataComponentFactory();
        return null;
    }
);

export default function Index() {

    const space = new Space('Test space');
    space.id = 1;
    const tag = new Tag('Test tag').in(space);
    tag.id = 123;
    tag.color = '#D00';
    tag.clean();

    const note = new Note('Test').in(space);
    note.addTag(tag);

    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        async function loadCacheData() {
            await renderTools.notu.cache.populate();
            setIsLoaded(true);
        }
        loadCacheData();
    }, []);

    return (
        <View
            style={styles.container}
        >
            <Text style={styles.text}>Edit app/index.tsx to edit this screen.</Text>
            <Link href="/about" style={styles.button}>Go to About screen</Link>

            {isLoaded && (
                <View>
                    <Text style={styles.text}>Here's a simple tag badge: <TagBadge tag={tag} notuRenderTools={renderTools} contextSpace={space} useUniqueName={false} onDelete={() => {}}/></Text>

                    <Text style={styles.text}>Here's a simple note tag badge: <NoteTagBadge noteTag={note.getTag(tag)} note={note} notuRenderTools={renderTools} contextSpace={space} useUniqueName={false} onDelete={() => {}}/></Text>
                </View>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292E',
        alignItems: 'center',
        justifyContent: 'center'
    },

    text: {
        color: '#FFF'
    },

    button: {
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#FFF'
    }
})