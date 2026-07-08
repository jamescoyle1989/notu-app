import { RefreshAction, UIAction } from "@/helpers/NoteAction";
import { getNotu } from "@/helpers/NotuSetup";
import { NoteChoice } from "@/notecomponents/NoteChoice";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import defs from './SystemSpaceDefs';

export class ShuffleChoicesProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != defs.shuffleChoicesProcess ||
            noteTag.tag.space.internalName != defs.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new ShuffleChoicesProcessData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): ShuffleChoicesProcessData {
        return new ShuffleChoicesProcessData(note.addTag(systemSpace.shuffleChoicesProcess));
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const renderTools = getNotu();
        const rootComponents = renderTools.noteTextSplitter(note, false);
        const allComponents = rootComponents.flatMap(x => x.getThisPlusAllChildComponents()) as any[];
        const choices = allComponents.filter(x => x instanceof NoteChoice) as NoteChoice[];
        for (const choice of choices)
            choice.shuffleSelection(true);
        note.text = rootComponents.map(x => x.getText()).join();
        await notu.saveNotes([note]);
        return new RefreshAction();
    }
}