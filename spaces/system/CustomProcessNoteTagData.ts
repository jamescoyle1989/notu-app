import { ShowErrorAction, UIAction } from "@/helpers/NoteAction";
import { getNotu } from "@/helpers/NotuSetup";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export class CustomProcessData extends ProcessDataBase {
    private _noteTag: NoteTag;
    
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.isInternal ||
            !noteTag.tag.links.find(x => 
                x.name == defs.process &&
                x.space.internalName == defs.internalName
            )
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
        this._noteTag = noteTag;
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new CustomProcessData(noteTag);
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const systemSpace = new SystemSpace(notu);
        const renderTools = getNotu();
        
        this._validateAgainstProcessCycles(this._noteTag.tag, systemSpace);
        
        const childProcessNote = (await notu.getNotes(`n.id = ${this._nt.tag.id}`))[0];
        const childProcessNoteTag = childProcessNote.tags.find(nt =>
            nt.tag.linksTo(systemSpace.process)
        );
        if (!childProcessNoteTag)
            return new ShowErrorAction(`Custom process '${this._nt.tag.name}' is not properly configured to call a child process.`);

        const childComponentFactory = renderTools.getComponentFactoryForNoteTag(
            childProcessNoteTag.tag,
            childProcessNote
        );
        if (!childComponentFactory)
            return new ShowErrorAction(`Custom process '${this._nt.tag.name}' is not properly configured to call a child process.`);
        
        const childProcessData = childComponentFactory.getDataObject(childProcessNoteTag) as ProcessDataBase;
        return await childProcessData.runProcess(childProcessNote, notu);
    }

    private _getChildProcessTag(tag: Tag, systemSpace: SystemSpace): Tag {
        return tag.links.find(t => 
            t.linksTo(systemSpace.process)
        );
    }

    private _validateAgainstProcessCycles(tag: Tag, systemSpace: SystemSpace) {
        let childProcessTag = tag;
        while (true) {
            childProcessTag = this._getChildProcessTag(childProcessTag, systemSpace);
            if (!childProcessTag)
                break;
            if (childProcessTag.id == tag.id)
                throw new Error(`Error! Detected cyclic process at '${tag.name}'.`);
        }
    }
}