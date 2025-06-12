import { Note, NoteTag, Notu, splitNoteTextIntoComponents, Tag } from "notu";
import { NoteComponent, NoteComponentProcessor } from "notu/dist/types/notecomponents/NoteComponent";
import { ReactNode } from "react";
import { NoteParagraph } from "../notecomponents/NoteParagraph";
import { DefaultTextProcessor } from "../notecomponents/NoteText";

export class NotuRenderTools {
    private _notu: Notu;
    get notu(): Notu { return this._notu; }

    private _noteTagDataComponentResolver: (tag: Tag, note: Note) => NoteTagDataComponentFactory | null;

    private _noteTextSplitter: (note: Note) => Array<any>;
    get noteTextSplitter(): (note: Note) => Array<any> { return this._noteTextSplitter; }

    constructor(
        notu: Notu,
        noteComponentProcessors: Array<NoteComponentProcessor>,
        noteTagDataComponentResolver: (tag: Tag, note: Note) => NoteTagDataComponentFactory | null
    ) {
        this._notu = notu;
        this._noteTagDataComponentResolver = noteTagDataComponentResolver;

        this._noteTextSplitter = (note: Note) => splitNoteTextIntoComponents(
            note,
            notu,
            noteComponentProcessors,
            new DefaultTextProcessor(),
            (components: Array<NoteComponent>) => new NoteParagraph(components)
        );
    }

    getComponentFactoryForNoteTag(tag: Tag, note: Note) {
        return this._noteTagDataComponentResolver(tag, note);
    }
}



export interface NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode;

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode;

    // Called when onConfirm has indicated that we want to proceed with saving the note
    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean>;
}