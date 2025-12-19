import { NoteAction, NoteActionsMenuBuilder, RefreshAction } from "@/helpers/NoteAction";
import { NoteTagDataComponentFactory, SpaceSettingsComponentFactory } from "@/helpers/NotuRenderTools";
import { Note, Notu, Space, Tag } from "notu";
import { CommonSpaceSetup } from "../common/CommonSpaceSetup";
import { LogicalSpace } from "../LogicalSpace";
import { CelebrationEventsProcessContext, generateCelebrationNotes } from "./CelebrationEventsProcess";
import CelebrationEventsProcessNoteTagDataComponentFactory from "./CelebrationEventsProcessNoteTagDataComponent";
import CelebrationNoteTagDataComponentFactory from "./CelebrationNoteTagDataComponent";
import CircleNoteTagDataComponentFactory from "./CircleNoteTagDataComponent";
import { PeopleSpaceSetup } from "./PeopleSpaceSetup";
import PersonCelebrationNoteTagDataComponentFactory from "./PersonCelebrationNoteTagDataComponent";
import PersonNoteTagDataComponentFactory from "./PersonNoteTagDataComponent";

export class PeopleSpace implements LogicalSpace {

    private _space: Space;
    get space(): Space { return this._space; }

    private _person: Tag;
    get person(): Tag { return this._person; }

    private _circle: Tag;
    get circle(): Tag { return this._circle; }

    private _celebration: Tag;
    get celebration(): Tag { return this._celebration; }


    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(PeopleSpaceSetup.internalName);
        this._person = notu.getTagByName(PeopleSpaceSetup.person, this._space);
        this._circle = notu.getTagByName(PeopleSpaceSetup.circle, this._space);
        this._celebration = notu.getTagByName(PeopleSpaceSetup.celebration, this._space);
    }


    async setup(notu: Notu): Promise<void> {
        await PeopleSpaceSetup.setup(notu);
        this._load(notu);
    }

    
    buildNoteActionsMenu(
        note: Note,
        menuBuilder: NoteActionsMenuBuilder,
        notu: Notu
    ) {
        if (note.ownTag?.name == PeopleSpaceSetup.celebrationEventsProcess) {
            menuBuilder.addToTopOfEnd(
                new NoteAction('Run',
                    async () => {
                        try {
                            const newNotes = await generateCelebrationNotes(
                                new CelebrationEventsProcessContext(notu)
                            );
                            await notu.saveNotes(newNotes);
                            return new RefreshAction();
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                )
            )
        }
    }


    resolveNoteTagDataComponentFactory(
        tag: Tag,
        note: Note
    ): NoteTagDataComponentFactory | null {

        if (tag.space.internalName == PeopleSpaceSetup.internalName) {
            if (tag.name == PeopleSpaceSetup.celebration)
                return new CelebrationNoteTagDataComponentFactory();

            if (tag.name == PeopleSpaceSetup.circle)
                return new CircleNoteTagDataComponentFactory();

            if (tag.name == PeopleSpaceSetup.person)
                return new PersonNoteTagDataComponentFactory();
        }

        if (
            tag.linksTo(this.celebration) &&
            !!note.tags.find(x => 
                x.tag.id == this.person.id ||
                x.tag.id == this.circle.id
            )
        )
            return new PersonCelebrationNoteTagDataComponentFactory();

        if (
            tag.space.internalName == CommonSpaceSetup.internalName &&
            tag.name == CommonSpaceSetup.process &&
            note.ownTag?.isInternal &&
            note.ownTag?.name == PeopleSpaceSetup.celebrationEventsProcess
        )
            return new CelebrationEventsProcessNoteTagDataComponentFactory();
        
        return null;
    }


    getSpaceSettingsComponentFactory(): SpaceSettingsComponentFactory | null {
        return null;
    }
}