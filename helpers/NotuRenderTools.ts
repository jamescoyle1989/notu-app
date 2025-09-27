import { LogicalSpace } from "@/spaces/LogicalSpace";
import { Note, NoteTag, Notu, Space, splitNoteTextIntoComponents, Tag } from "notu";
import { NoteComponent, NoteComponentProcessor } from "notu/dist/types/notecomponents/NoteComponent";
import { ReactNode } from "react";
import { NoteParagraph } from "../notecomponents/NoteParagraph";
import { NoteText } from "../notecomponents/NoteText";
import { NoteAction, NoteActionsMenuBuilder } from "./NoteAction";

export class NotuRenderTools {
    private _notu: Notu;
    get notu(): Notu { return this._notu; }

    private _noteTextSplitter: (note: Note) => Array<any>;
    get noteTextSplitter(): (note: Note) => Array<any> { return this._noteTextSplitter; }

    private _noteComponentProcessors: Array<NoteComponentProcessor>;
    get noteComponentProcessors() { return this._noteComponentProcessors; }

    private _logicalSpaces: Array<LogicalSpace>;
    get logicalSpaces() { return this._logicalSpaces; }

    constructor(
        notu: Notu,
        noteComponentProcessors: Array<NoteComponentProcessor>,
        logicalSpaces: Array<LogicalSpace>
    ) {
        this._notu = notu;
        this._logicalSpaces = logicalSpaces;

        this._noteComponentProcessors = noteComponentProcessors;
        this._noteTextSplitter = (note: Note) => splitNoteTextIntoComponents(
            note,
            notu,
            noteComponentProcessors,
            (text: string) => new NoteText(text),
            (components: Array<NoteComponent>) => new NoteParagraph(components)
        );
    }

    getComponentFactoryForNoteTag(tag: Tag, note: Note): NoteTagDataComponentFactory | null {
        for (const space of this.logicalSpaces) {
            const factory = space.resolveNoteTagDataComponentFactory(tag, note);
            if (!!factory)
                return factory;
        }
        return null;
    }

    getSettingsComponentFactoryForSpace(space: Space): SpaceSettingsComponentFactory | null {
        const logicalSpace = this.logicalSpaces.find(x => x.space.name == space.name);
        if (!!logicalSpace)
            return logicalSpace.getSpaceSettingsComponentFactory();
        return null;
    }

    buildNoteActionsMenu(note: Note): Array<NoteAction> {
        const builder = new NoteActionsMenuBuilder();
        for (const space of this.logicalSpaces)
            space.buildNoteActionsMenu(note, builder, this.notu);
        return builder.actions;
    }
}



export interface NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode;

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode;

    // Called when onConfirm has indicated that we want to proceed with saving the note
    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean>;
}


export interface SpaceSettingsComponentFactory {

    getEditorComponent(space: Space, notu: Notu): ReactNode;

    validate(space: Space, notu: Notu): Promise<boolean>;
}