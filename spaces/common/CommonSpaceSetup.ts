import { Note, Notu, Space } from "notu";
import { PageData } from "../system/PageNoteTagData";
import { SystemSpace } from "../system/SystemSpace";

export class CommonSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.common'; }
    static get address(): string { return 'Address'; }
    static get cancelled(): string { return 'Cancelled'; }
    static get duration(): string { return 'Duration'; }
    static get finished(): string { return 'Finished'; }
    static get generated(): string { return 'Generated'; }
    static get ignore(): string { return 'Ignore'; }
    static get log(): string { return 'Log'; }
    static get recurring(): string { return 'Recurring'; }
    static get scheduled(): string { return 'Scheduled'; }
    static get started(): string { return 'Started'; }

    static async setup(notu: Notu): Promise<void> {
        let commonSpace = notu.getSpaceByInternalName(this.internalName);
        if (!commonSpace) {
            commonSpace = new Space('Common').v('1.0.0');
            commonSpace.internalName = this.internalName;
            await notu.saveSpace(commonSpace);

            const address = new Note(`When added to a note, this tag stores address data. This includes a map URL, coordinates, and human-readable name.`)
                .in(commonSpace).setOwnTag(this.address);
            address.ownTag.asInternal();

            const cancelled = new Note('When added to a note, this tag stores date data to show when the note was cancelled. It also allows for an optional cancellation reason.')
                .in(commonSpace).setOwnTag(this.cancelled);
            cancelled.ownTag.asInternal();

            const duration = new Note(`When added to a note, tis tag stores timing data. It specifies that the note has a set duration associated with it. The Duration tag is very similar to the Scheduled tag, though with the difference that the Duration tag doesn't require that exact start or ending times are known yet.`)
                .in(commonSpace).setOwnTag(this.duration);
            duration.ownTag.asInternal();

            const finished = new Note(`When added to a note, this tag stores date data to show when the note was finished.`)
                .in(commonSpace).setOwnTag(this.finished);
            finished.ownTag.asInternal();

            const generated = new Note(`Notu has various internal processes which can generate their own notes. Each of these processes are expected to create all notes with the Generated tag added to them, this way they can easily identify which notes they made, and not accidentally interfere with notes that you created yourself. As a user there is not much reason to ever use this tag yourself.`)
                .in(commonSpace).setOwnTag(this.generated);
            generated.ownTag.asInternal();

            const ignore = new Note(`Adding this tag to a note marks that you're not ready to delete it just yet, but the information it contains is no longer relevant. This is especially useful with notes that get interacted with by system processes as a way to get them to skip over particular notes.`)
                .in(commonSpace).setOwnTag(this.ignore);
            ignore.ownTag.asInternal();

            const log = new Note(`Notu has various internal processes which can help generate new notes, update existing ones etc. Without any feedback it can sometimes be quite hard to determine what exactly has changed. To combat this, the processes should always produce notes with this tag so that you can see at a glance the full history of what was actually done.`)
                .in(commonSpace).setOwnTag(this.log);
            log.ownTag.asInternal();

            const recurring = new Note(`When added to a note, this tag defines a schedule for some recurring action to happen. This tag is generally only useful when added to notes that are operated on by some process. A good example of this would be routine definitions, where each one is expected to have a Recurring tag added to it to define how often that routine happens.`)
                .in(commonSpace).setOwnTag(this.recurring);
            recurring.ownTag.asInternal();

            const scheduled = new Note('When added to a note, this tag stores scheduling data. It indicates that the note has set start and end times.')
                .in(commonSpace).setOwnTag(this.scheduled);
            scheduled.ownTag.asInternal();

            const started = new Note(`When added to a note, this tag stores date data to show when the note was started.`)
                .in(commonSpace).setOwnTag(this.started);
            started.ownTag.asInternal();
            
            await notu.saveNotes([
                address,
                cancelled,
                duration,
                finished,
                generated,
                ignore,
                log,
                recurring,
                scheduled,
                started
            ]);

            const systemSpaceObj = new SystemSpace(notu);

            const setupPage = new Note(`This page will display the notes that make up the Common space setup.`)
                .in(commonSpace).setOwnTag('Common Space Setup Page');
            setupPage.ownTag.asInternal();
            const setupPageData = PageData.addTag(setupPage, systemSpaceObj);
            setupPageData.name = 'Common Space Setup';
            setupPageData.group = 'System';
            setupPageData.order = 2;
            setupPageData.query = `t.isInternal`;
            setupPageData.searchAllSpaces = false;

            await notu.saveNotes([setupPage]);
        }
    }
}