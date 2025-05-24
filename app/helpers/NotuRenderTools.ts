import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";

export class NotuRenderTools {
    private _notu: Notu;
    get notu(): Notu { return this._notu; }

    private _noteTagDataComponentResolver: (tag: Tag, note: Note) => NoteTagDataComponentFactory | null;

    constructor(
        notu: Notu,
        noteTagDataComponentResolver: (tag: Tag, note: Note) => NoteTagDataComponentFactory | null
    ) {
        this._notu = notu;
        this._noteTagDataComponentResolver = noteTagDataComponentResolver;
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