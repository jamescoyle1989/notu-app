import { RefreshAction, UIAction } from "@/helpers/NoteAction";
import { getNotu } from "@/helpers/NotuSetup";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ProcessDataBase } from "./ProcessNoteTagDataBaseClass";
import { SystemSpace } from "./SystemSpace";
import { SystemSpaceSetup } from "./SystemSpaceSetup";

export class CustomProcessData extends ProcessDataBase {
    constructor(noteTag: NoteTag) {
        if (
            noteTag.tag.isInternal ||
            !noteTag.tag.links.find(x => 
                x.name == SystemSpaceSetup.process &&
                x.space.internalName == SystemSpaceSetup.internalName
            )
        ) {
            throw Error('Attempted to create a note tag data helper for a notetag that it does not support');
        }
        super(noteTag);
    }
    static new(noteTag: NoteTag) {
        if (!noteTag)
            return null;
        return new CustomProcessData(noteTag);
    }

    async runProcess(note: Note, notu: Notu): Promise<UIAction> {
        const systemSpace = new SystemSpace(notu);
        const renderTools = getNotu();
        
        this._validateAgainstProcessCycles(note.ownTag, systemSpace);

        const childProcessTag = this._getChildProcessTag(note.ownTag, systemSpace);
        if (!childProcessTag)
            return new RefreshAction();

        const childProcessNote = (await notu.getNotes(`n.id = ${childProcessTag.id}`))[0];
        const childProcessNoteTag = childProcessNote.tags.find(nt =>
            nt.tag.linksTo(systemSpace.process)
        );
        const childComponentFactory = renderTools.getComponentFactoryForNoteTag(childProcessNoteTag.tag, childProcessNote);
        if (!childComponentFactory)
            return new RefreshAction();

        const childProcessData = childComponentFactory.getDataObject(childProcessNoteTag) as ProcessDataBase;
        return await childProcessData.runProcess(childProcessNote, notu);
    }

    private _getChildProcessTag(tag: Tag, systemSpace: SystemSpace): Tag {
        return tag.links.find(t => 
            t.linksTo(systemSpace.process) &&
            t.links.find(ct => ct.linksTo(systemSpace.process))
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