import { UIAction } from "@/helpers/NoteAction";
import { Note, NoteTag, Notu } from "notu";
import defs from "./SystemSpaceDefs";

export class ProcessDataBase {
    protected _nt: NoteTag;
    constructor(noteTag: NoteTag) {
        this._nt = noteTag;
        if (!noteTag.data)
            noteTag.data = {};
        this.name = this.name;
    }

    get name(): string {
        if (this._nt.data.name == undefined)
            return this._nt.tag.name;
        return this._nt.data.name;
    }
    set name(value: string) {
        value = value ?? '';
        if (this._nt.data.name != value && this._nt.isClean)
            this._nt.dirty();
        this._nt.data.name = value;
    }

    requiresName(note: Note): boolean {
        if (note.tags.find(x => 
            (
                x.tag.name == defs.processAvailability ||
                x.tag.name == defs.page
            ) &&
            x.tag.space.internalName == defs.internalName
        ))
            return true;
        return false;
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        throw Error('You should have implemented this method in your child class.');
    }
}