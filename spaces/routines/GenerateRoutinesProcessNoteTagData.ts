import { RefreshAction, UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "../system/ProcessNoteTagDataBaseClass";
import { generateRoutines, GenerateRoutinesProcessContext } from "./GenerateRoutinesProcess";
import { showOverdueRoutinesScreen } from "./GenerateRoutinesProcessUI";
import { RoutinesSpace } from "./RoutinesSpace";
import { RoutinesSpaceSetup } from "./RoutinesSpaceSetup";

export class GenerateRoutinesProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != RoutinesSpaceSetup.generateRoutinesProcess ||
            noteTag.tag.space.internalName != RoutinesSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support.');
        }
        super(noteTag);
        this.saveNotesToSpaceId = this.saveNotesToSpaceId;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new GenerateRoutinesProcessData(noteTag);
    }
    static addTag(note: Note, routinesSpace: RoutinesSpace): GenerateRoutinesProcessData {
        return new GenerateRoutinesProcessData(note.addTag(routinesSpace.generateRooutinesProcess));
    }

    get saveNotesToSpaceId(): number { return this._nt.data.saveNotesToSpaceId; }
    set saveNotesToSpaceId(value: number) {
        if (this._nt.data.saveNotesToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveNotesToSpaceId = value;
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const routinesSpace = new RoutinesSpace(notu);
        const processContext = new GenerateRoutinesProcessContext(
            note.getTagData(routinesSpace.generateRooutinesProcess, GenerateRoutinesProcessData),
            notu
        );
        const overdueRoutines = await processContext.getOverduePendingRoutineTasks();
        if (overdueRoutines.length > 0)
            return showOverdueRoutinesScreen(overdueRoutines, notu, processContext);

        const newNotes = await generateRoutines(processContext);
        await notu.saveNotes(newNotes);
        
        return new RefreshAction();
    }
}