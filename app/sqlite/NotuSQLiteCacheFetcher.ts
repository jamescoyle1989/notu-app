import { ISQLiteConnection } from './SQLiteConnection';
import { mapIntToColor } from './SQLMappings';


export class NotuSQLiteCacheFetcher {

    private _connectionFactory: () => Promise<ISQLiteConnection>;

    constructor(connectionFactory: () => Promise<ISQLiteConnection>) {
        this._connectionFactory = connectionFactory;
    }


    async getSpacesData(): Promise<Array<any>> {
        const connection = await this._connectionFactory();
        try {
            const spaces = (await connection
                .getAll('SELECT id, name, internalName, version, settings FROM Space;'))
                .map(x => ({
                    state: 'CLEAN',
                    id: x.id,
                    name: x.name,
                    internalName: x.internalName,
                    version: x.version,
                    useCommonSpace: false,
                    settings: x.settings,
                    links: []
                }));
            const spacesMap = new Map<number, any>();
            for (const space of spaces)
                spacesMap.set(space.id, space);
            (await connection
                .getAll('SELECT fromSpaceId, name, toSpaceId FROM SpaceLink'))
                .map(x => spacesMap.get(x.fromSpaceId).links.push({name: x.name, toSpaceId: x.toSpaceId}));
            return spaces;
        }
        finally {
            await connection.close();
        }
    }


    async getTagsData(): Promise<Array<any>> {
        const connection = await this._connectionFactory();
        try {
            const tags = (await connection
                .getAll('SELECT n.id, t.name, n.spaceId, t.color, t.availability, t.isInternal FROM Note n INNER JOIN Tag t ON n.id = t.id;'))
                .map(x => ({
                    state: 'CLEAN',
                    id: x.id,
                    name: x.name,
                    spaceId: x.spaceId,
                    color: mapIntToColor(x.color),
                    availability: x.availability,
                    isInternal: !!x.isInternal,
                    links: []
                }));
            const tagsMap = new Map<number, any>();
            for (const tag of tags)
                tagsMap.set(tag.id, tag);
            (await connection
                .getAll('SELECT t.id AS fromId, nt.tagId AS toId FROM Tag t INNER JOIN NoteTag nt ON t.id = nt.noteId;'))
                .map(x => tagsMap.get(x.fromId).links.push(x.toId));
            return tags;
        }
        finally {
            await connection.close();
        }
    }
}