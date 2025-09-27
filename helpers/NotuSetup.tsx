import { NoteChecklistProcessor } from '@/notecomponents/NoteChecklist';
import { NoteLinkProcessor } from '@/notecomponents/NoteLink';
import { CommonSpace } from '@/spaces/common/CommonSpace';
import { NotuSQLiteCacheFetcher } from '@/sqlite/NotuSQLiteCacheFetcher';
import { NotuSQLiteClient } from '@/sqlite/NotuSQLiteClient';
import { ExpoSQLiteConnection } from '@/sqlite/SQLiteConnection';
import * as SQLite from 'expo-sqlite';
import { Note, NoteTag, Notu, NotuCache, Space, Tag } from 'notu';
import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { getTextContrastColor } from './ColorHelpers';
import { NoteTagDataComponentFactory, NotuRenderTools, SpaceSettingsComponentFactory } from './NotuRenderTools';


class CommonSpaceSettingsComponentFactory implements SpaceSettingsComponentFactory {

    getEditorComponent(space: Space, notu: Notu): ReactNode {
        return (
            <View>
                <Text>I am settings for the Common space!</Text>
            </View>
        );
    }

    validate(space: Space, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}


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


let _renderTools: NotuRenderTools = null;


export async function setupNotu(): Promise<NotuRenderTools> {
    if (_renderTools != null)
        return _renderTools;

    const db = await SQLite.openDatabaseAsync('notu.db', { useNewConnection: true });

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

    await notuVal.setup();
    await notuVal.cache.populate();

    const renderToolsVal = new NotuRenderTools(
        notuVal,
        [
            new NoteLinkProcessor(),
            new NoteChecklistProcessor()
        ],
        (tag: Tag, note: Note) => {
            if (tag.name == 'Test tag')
                return new TestNoteTagDataComponentFactory();
            return null;
        },
        (space: Space) => {
            if (space.name == 'Common')
                return new CommonSpaceSettingsComponentFactory();
            return null;
        },
        [
            new CommonSpace(notuVal)
        ]
    );
    for (const space of renderToolsVal.logicalSpaces)
        await space.setup(notuVal);
    _renderTools = renderToolsVal;
    return _renderTools;
}


export function getNotu(): NotuRenderTools {
    if (_renderTools == null)
        throw Error('Notu has not yet been loaded, getNotu is invalid before that point.');
    return _renderTools;
}