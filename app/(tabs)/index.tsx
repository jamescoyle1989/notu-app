import * as SQLite from 'expo-sqlite';
import { Note, NoteTag, Notu, NotuCache, Space, Tag } from "notu";
import { ReactNode, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { NoteViewerAction } from "../components/NoteViewer";
import SearchList from "../components/SearchList";
import { getTextContrastColor } from "../helpers/ColorHelpers";
import { NoteTagDataComponentFactory, NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';
import { NoteTextProcessor } from "../notecomponents/NoteText";
import { NotuSQLiteCacheFetcher } from '../sqlite/NotuSQLiteCacheFetcher';
import { NotuSQLiteClient } from '../sqlite/NotuSQLiteClient';
import { ExpoSQLiteConnection } from '../sqlite/SQLiteConnection';


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

export default function Index() {
    
    const [isLoaded, setIsLoaded] = useState(false);
    const [notu, setNotu] = useState<Notu>(null);
    const [renderTools, setRenderTools] = useState<NotuRenderTools>(null);
    const [error, setError] = useState('');
    const [dbInfo, setDbInfo] = useState('');
    useEffect(() => {
        async function loadCacheData() {
            try {
                const db = await SQLite.openDatabaseAsync('notu.db', { useNewConnection: true });
                setDbInfo(`path: ${db.databasePath}`)
                const notuCache = new NotuCache(
                    new NotuSQLiteCacheFetcher(
                        async () => Promise.resolve(new ExpoSQLiteConnection(db))
                    )
                );
                const notuVal = new Notu(
                    new NotuSQLiteClient(
                        async () => Promise.resolve(new ExpoSQLiteConnection(db)),
                        notuCache
                    ),
                    notuCache
                );
                setNotu(notuVal);

                const renderToolsVal = new NotuRenderTools(
                    notuVal,
                    [
                        new NoteTextProcessor()
                    ],
                    (tag: Tag, note: Note) => {
                        if (tag.name == 'Test tag')
                            return new TestNoteTagDataComponentFactory();
                        return null;
                    }
                );
                setRenderTools(renderToolsVal);

                await notuVal.setup();
                await notuVal.cache.populate();

                let commonSpace = notuVal.getSpaceByName('Common');
                if (!commonSpace) {
                    commonSpace = new Space('Common').v('1.0.0');
                    await notuVal.saveSpace(commonSpace);

                    const setup = new Note('This contains all the expected tags for Common space to work correctly.')
                        .in(commonSpace).setOwnTag('Setup');
                    setup.ownTag.asPrivate();
                    await notuVal.saveNotes([setup]);

                    const thought = new Note('This marks a note as being some thought that I\'ve had on a particular subject.')
                        .in(commonSpace).setOwnTag('Thought');
                    thought.ownTag.asPublic();
                    thought.addTag(setup.ownTag);

                    const info = new Note('This marks a note as being some info about a particular subject that may be useful later.')
                        .in(commonSpace).setOwnTag('Info');
                    info.ownTag.asPublic();
                    info.addTag(setup.ownTag);

                    await notuVal.saveNotes([thought, info]);
                }

                setIsLoaded(true);
                setError('');
            }
            catch (err) {
                setError(`'${err.message}' at '${err.stack}'`);
            }
        }
        loadCacheData();
    }, []);

    return (
        <View style={s.view.background}>
            <ScrollView>
                <Text style={s.text.plain}>Date: {new Date().toLocaleTimeString()}</Text>
                <Text style={s.text.plain}>Info: {dbInfo}</Text>
                <Text style={s.text.plain}>Error: {error}</Text>
            </ScrollView>

            {isLoaded && (
                <View>
                    <SearchList query={`#Setup`}
                                searchSpace={notu.getSpaceByName('Common')}
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