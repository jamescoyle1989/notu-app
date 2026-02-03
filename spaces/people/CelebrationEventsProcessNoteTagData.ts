import { RefreshAction, UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu } from "notu";
import { ProcessDataBase } from "../processes/ProcessNoteTagDataBaseClass";
import { CelebrationEventsProcessContext, generateCelebrationNotes } from "./CelebrationEventsProcess";
import { PeopleSpace } from "./PeopleSpace";
import { PeopleSpaceSetup } from "./PeopleSpaceSetup";

export class CelebrationEventsProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != PeopleSpaceSetup.celebrationEventsProcess ||
            noteTag.tag.space.internalName != PeopleSpaceSetup.internalName
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
        this.saveEventsToSpaceId = this.saveEventsToSpaceId;
        this.savePlanTasksToSpaceId = this.savePlanTasksToSpaceId;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new CelebrationEventsProcessData(noteTag);
    }
    static addTag(note: Note, peopleSpace: PeopleSpace): CelebrationEventsProcessData {
        return new CelebrationEventsProcessData(note.addTag(peopleSpace.celebrationEventsProcess));
    }

    get saveEventsToSpaceId(): number { return this._nt.data.saveEventsToSpaceId; }
    set saveEventsToSpaceId(value: number) {
        if (this._nt.data.saveEventsToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveEventsToSpaceId = value;
    }

    get savePlanTasksToSpaceId(): number { return this._nt.data.savePlanTasksToSpaceId; }
    set savePlanTasksToSpaceId(value: number) {
        if (this._nt.data.savePlanTasksToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.savePlanTasksToSpaceId = value;
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const peopleSpace = new PeopleSpace(notu);
        const newNotes = await generateCelebrationNotes(
            new CelebrationEventsProcessContext(
                note.getTagData(peopleSpace.celebrationEventsProcess, CelebrationEventsProcessData),
                notu
            )
        );
        await notu.saveNotes(newNotes);
        return new RefreshAction();
    }
}