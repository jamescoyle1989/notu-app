import { RefreshAction, UIAction } from "@/helpers/NoteAction";
import { getNotu } from "@/helpers/NotuSetup";
import { NoteChecklist } from "@/notecomponents/NoteChecklist";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import defs from './SystemSpaceDefs';

export class RemoveFinishedChecklistItemsProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != defs.removeFinishedChecklistItemsProcess ||
            noteTag.tag.space.internalName != defs.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new RemoveFinishedChecklistItemsProcessData(noteTag);
    }
    static addTag(note: Note, systemSpace: SystemSpace): RemoveFinishedChecklistItemsProcessData {
        return new RemoveFinishedChecklistItemsProcessData(note.addTag(systemSpace.removeFinishedChecklistItemsProcess));
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const renderTools = getNotu();
        const rootComponents = renderTools.noteTextSplitter(note, false);
        const allComponents = rootComponents.flatMap(x => x.getThisPlusAllChildComponents()) as any[];
        const checklists = allComponents.filter(x => x instanceof NoteChecklist) as NoteChecklist[];
        for (const checklist of checklists)
            checklist.removeFinishedItems();
        note.text = rootComponents.map(x => x.getText()).join();
        await notu.saveNotes([note]);
        return new RefreshAction();
    }
}