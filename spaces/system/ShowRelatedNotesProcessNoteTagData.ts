import { ShowDynamicPageAction, UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu, Space } from "notu";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export class ShowRelatedNotesProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != defs.showRelatedNotesProcess ||
            noteTag.tag.space.internalName != defs.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
        this.spaceId = this.spaceId;
        this.query = this.query;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new ShowRelatedNotesProcessData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): ShowRelatedNotesProcessData {
        return new ShowRelatedNotesProcessData(note.addTag(systemSpace.showRelatedNotesProcess));
    }

    get spaceId(): number { return this._nt.data.spaceId; }
    set spaceId(value: number) {
        value = value ?? 0;
        if (this._nt.data.spaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.spaceId = value;
    }

    get query(): string { return this._nt.data.query; }
    set query(value: string) {
        value = value ?? `#{TAG}`;
        if (this._nt.data.query != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.query = value;
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        if (this.query.includes('{TAG}') && !note.ownTag)
            throw new Error(`Show Related Notes with '{TAG}' present in the query can only be called for notes which have their own tag set.`);

        let space: Space = null;
        if (this.spaceId < 0)
            space = note.space;
        else
            space = notu.getSpace(this.spaceId) ?? null;

        let query = this.query;
        let title = 'Related Notes';
        if (query.includes('{TAG}')) {
            query = query.replaceAll('{TAG}', `[${note.ownTag.getFullName()}]`);
            title = `${note.ownTag.getFullName()} related notes`;
        }
        
        return Promise.resolve(new ShowDynamicPageAction(title, space, query));
    }
}