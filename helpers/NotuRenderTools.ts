import { LogicalSpace } from "@/spaces/LogicalSpace";
import { Note, NoteTag, Notu, splitNoteTextIntoComponents, Tag } from "notu";
import { NoteComponent, NoteComponentProcessor } from "notu/dist/types/notecomponents/NoteComponent";
import { ReactNode } from "react";
import { NoteParagraph } from "../notecomponents/NoteParagraph";
import { NoteText } from "../notecomponents/NoteText";
import { NoteAction, NoteActionsMenuBuilder } from "./NoteAction";

export class NotuRenderTools {
    private _notu: Notu;
    get notu(): Notu { return this._notu; }

    private _noteTextSplitter: (note: Note, forEdit?: boolean) => Array<any>;
    get noteTextSplitter(): (note: Note, forEdit?: boolean) => Array<any> { return this._noteTextSplitter; }

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
        this._noteTextSplitter = (note: Note, forEdit: boolean = false) => splitNoteTextIntoComponents(
            note,
            notu,
            forEdit,
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

    buildNoteActionsMenu(
        note: Note,
        textComponents: Array<any>,
        customActions?: (note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) => void
    ): Array<NoteAction> {
        const builder = new NoteActionsMenuBuilder();
        if (!!customActions) {
            customActions(note, builder, this._notu);
            return builder.actions;
        }
        for (const space of this.logicalSpaces)
            space.buildNoteActionsMenu(note, builder, this.notu);
        if (textComponents != null) {
            for (const rootComponent of textComponents) {
                for (const component of rootComponent.getThisPlusAllChildComponents())
                    component.buildNoteActionsMenu(note, builder, this.notu);
            }
        }
        return builder.actions;
    }
}



export interface NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode;

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode;

    // Called when onConfirm has indicated that we want to proceed with saving the note
    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean>;
}


export interface NoteTagDataComponentProps {
    noteTag: NoteTag,
    note?: Note,
    notu?: Notu,
    textColor?: string,
    refreshCallback?: () => void
}