import { ShowDynamicPageAction, UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu, Space } from "notu";
import { PageData } from "./PageNoteTagData";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export class ShowRelatedNotesProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag, note: Note) {
        if (
            noteTag.tag.name != defs.showRelatedNotesProcess ||
            noteTag.tag.space.internalName != defs.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
        this.spaceId = this.spaceId;
        this.query = this.query;
        this._note = note;
    }
    static new(noteTag: NoteTag, note: Note) {
        if (!noteTag)
            return null;
        return new ShowRelatedNotesProcessData(noteTag, note);
    }
    static addTag(note: Note, systemSpace: SystemSpace): ShowRelatedNotesProcessData {
        return new ShowRelatedNotesProcessData(note.addTag(systemSpace.showRelatedNotesProcess), note);
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

    private _note: Note;

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const systemSpace = new SystemSpace(notu);
        const relatedPageNT = this._note.tags.find(x => x.tag.linksTo(systemSpace.page));
        
        if (!!relatedPageNT) {
            const relatedPageNote = (await notu.getNotes(`n.id = ${relatedPageNT.tag.id}`))[0];
            const newNote = relatedPageNote.duplicateAsNew();
            const newPageData = newNote.getTagData(systemSpace.page, PageData);
            newPageData.query = this._validatePageQuery(newPageData.query, note);
            if (!!note.ownTag)
                newPageData.name = newPageData.name.replaceAll('{TAG}', note.ownTag.name);
            return new ShowDynamicPageAction(newNote, notu);
        }
        
        let title = 'Related Notes';
        if (this.query.includes('{TAG}'))
            title = `${note.ownTag.getFullName()} related notes`;

        let space: Space = null;
        if (this.spaceId < 0)
            space = note.space;
        else
            space = notu.getSpace(this.spaceId) ?? null;

        const dynamicNote = new Note().in(space);
        const dynamicPageData = PageData.addTag(dynamicNote, systemSpace);
        dynamicPageData.name = title;
        dynamicPageData.query = this._validatePageQuery(this.query, note);
        dynamicPageData.searchAllSpaces = this.spaceId < 0;
        dynamicPageData.showQuery = true;
        
        return new ShowDynamicPageAction(dynamicNote, notu);
    }

    private _validatePageQuery(query: string, note: Note) {
        if (query.includes('{TAG}')) {
            if (!note.ownTag)
                throw new Error(`Show Related Notes with '{TAG}' present in the query can only be called for notes which have their own tag set.`);
            query = query.replaceAll('{TAG}', `#[${note.ownTag.getFullName()}]`);
        }
        return query;
    }
}