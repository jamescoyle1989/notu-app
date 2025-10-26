import { NoteChecklistProcessor } from '@/notecomponents/NoteChecklist';
import { NoteLinkProcessor } from '@/notecomponents/NoteLink';
import { NoteRandomProcessor } from '@/notecomponents/NoteRandom';
import { CommonSpace } from '@/spaces/common/CommonSpace';
import { NotuSQLiteCacheFetcher } from '@/sqlite/NotuSQLiteCacheFetcher';
import { NotuSQLiteClient } from '@/sqlite/NotuSQLiteClient';
import { ExpoSQLiteConnection } from '@/sqlite/SQLiteConnection';
import * as SQLite from 'expo-sqlite';
import { Notu, NotuCache } from 'notu';
import { NotuRenderTools } from './NotuRenderTools';


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
            new NoteChecklistProcessor(),
            new NoteRandomProcessor()
        ],
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