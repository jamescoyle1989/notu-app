import * as SQLite from 'expo-sqlite';
import { Note, NoteTag, Notu, NotuCache, NotuHttpClient, Space, Tag } from "notu";
//import { ExpoSQLiteConnection, NotuSQLiteCacheFetcher, NotuSQLiteClient } from "notu-sqlite";
import { ReactNode, useEffect, useState } from "react";
import { Text, View } from "react-native";
import NoteEditor from "../components/NoteEditor";
import NoteList from "../components/NoteList";
import { NoteSearch } from "../components/NoteSearch";
import NoteTagBadge from "../components/NoteTagBadge";
import { NoteViewerAction } from "../components/NoteViewer";
import SearchList from "../components/SearchList";
import TagBadge from "../components/TagBadge";
import { getTextContrastColor } from "../helpers/ColorHelpers";
import { NoteTagDataComponentFactory, NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';
import { NoteTextProcessor } from "../notecomponents/NoteText";


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

const db = SQLite.openDatabaseSync('notu');
/*const notuCache = new NotuCache(
    new NotuSQLiteCacheFetcher(
        async () => new ExpoSQLiteConnection(db)
    )
);
const notu = new Notu(
    new NotuSQLiteClient(
        async () => new ExpoSQLiteConnection(db),
        notuCache
    ),
    notuCache
);*/

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
    [
        new NoteTextProcessor()
    ],
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
    const tag2 = new Tag('Test tag 2').in(space);
    tag2.id = 234;
    tag2.color = '#0D0';
    tag2.clean();

    const note = new Note('Test').in(space);
    note.addTag(tag);
    note.id = 1;

    const note2 = new Note('Test 2').in(space);
    note2.addTag(tag2);
    note2.id = 2;

    const [isLoaded, setIsLoaded] = useState(false);
    const [query, setQuery] = useState(`text LIKE '%test%'`);
    useEffect(() => {
        async function loadCacheData() {
            await renderTools.notu.cache.populate();
            setIsLoaded(true);
        }
        loadCacheData();
    }, []);

    return (
        <View style={s.view.background}>

            <Text style={s.text.plain}>Edit app/index.tsx to edit this screen.</Text>

            {isLoaded && (
                <View>
                    <NoteSearch space={space} notu={renderTools.notu}
                                query={query} onQueryChanged={v => setQuery(v)}/>

                    <Text style={s.text.plain}>Here's a simple tag badge: <TagBadge tag={tag2} notuRenderTools={renderTools} contextSpace={space} useUniqueName={false} onDelete={() => {}}/></Text>

                    <Text style={s.text.plain}>Here's a simple note tag badge: <NoteTagBadge noteTag={note.getTag(tag)} note={note} notuRenderTools={renderTools} contextSpace={space} useUniqueName={false} onDelete={() => {}}/></Text>

                    <NoteList notes={[note, note2]}
                              notuRenderTools={renderTools}
                              actionsGenerator={n => [
                                new NoteViewerAction('Test Action 1', () => {}, false),
                                new NoteViewerAction('Test Action 2', () => {}, true)
                              ]}/>

                    <NoteEditor note={note}
                                notuRenderTools={renderTools}
                                tags={[tag, tag2]}
                                onSave={() => {}}
                                onCancel={() => {}}/>

                    <SearchList query={`#Test`}
                                searchSpace={space}
                                notuRenderTools={renderTools}
                                actionsGenerator={n => [
                                    new NoteViewerAction('Test Action 1', () => {}, false),
                                    new NoteViewerAction('Test Action 2', () => {}, true)
                                ]}
                                actionsBar={() => (
                                    <Text style={s.text.plain}>Hello from actions bar</Text>
                                )}/>
                </View>
            )}
        </View>
    );
}