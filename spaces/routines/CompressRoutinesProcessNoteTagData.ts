import { Note, NoteTag } from "notu";
import { ProcessDataBase } from "../processes/ProcessNoteTagDataBaseClass";
import { RoutinesSpace } from "./RoutinesSpace";
import { RoutinesSpaceSetup } from "./RoutinesSpaceSetup";

export class CompressRoutinesProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.name != RoutinesSpaceSetup.compressRoutinesProcess ||
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
        return new CompressRoutinesProcessData(noteTag);
    }
    static addTag(note: Note, routinesSpace: RoutinesSpace): CompressRoutinesProcessData {
        return new CompressRoutinesProcessData(note.addTag(routinesSpace.compressRoutinesProcess));
    }

    get saveNotesToSpaceId(): number { return this._nt.data.saveNotesToSpaceId; }
    set saveNotesToSpaceId(value: number) {
        if (this._nt.data.saveNotesToSpaceId != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.saveNotesToSpaceId = value;
    }
}