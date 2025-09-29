import { Note, Notu, Page, Space } from "notu";

export class CommonSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.common'; }
    static get address(): string { return 'Address'; }
    static get cancelled(): string { return 'Cancelled'; }
    static get category(): string { return 'Category'; }
    static get duration(): string { return 'Duration'; }
    static get finished(): string { return 'Finished'; }
    static get generated(): string { return 'Generated'; }
    static get ignore(): string { return 'Ignore'; }
    static get info(): string { return 'Info'; }
    static get journal(): string { return 'Journal'; }
    static get memory(): string { return 'Memory'; }
    static get pinned(): string { return 'Pinned'; }
    static get scheduled(): string { return 'Scheduled'; }
    static get thought(): string { return 'Thought'; }

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

            const category = new Note(`The Category tag is intended as a parent for specific category tags that you can define yourself. For example, you may want to create a new note with its own 'Health' tag that you add the Category tag to. This is now a Health category. You can then add this new Health tag to upcoming doctor's appointments, medical payments, thoughts and information on ways to feel better in order to group all these things together under the single category of 'Health'.`)
                .in(commonSpace).setOwnTag(this.category);
            category.ownTag.asInternal();

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

            const info = new Note('Adding this tag to a note marks that the note holds some information about a particular subject that may be useful later.')
                .in(commonSpace).setOwnTag(this.info);
            info.ownTag.asInternal();

            const journal = new Note('Adding this tag to a note marks that the note contains a journal of your feelings at the time of writing on a particular subject.')
                .in(commonSpace).setOwnTag(this.journal);
            journal.ownTag.asInternal();

            const memory = new Note(`Adding this tag to a note marks that the note is a helper for a memory.`)
                .in(commonSpace).setOwnTag(this.memory);
            memory.ownTag.asInternal();

            const pinned = new Note('Adding this tag to a note is an easy way to highlight that the note is important and should remain on top of your mind.')
                .in(commonSpace).setOwnTag(this.pinned);
            pinned.ownTag.asInternal();

            const scheduled = new Note('When added to a note, this tag stores scheduling data. It indicates that the note has set start and end times.')
                .in(commonSpace).setOwnTag(this.scheduled);
            scheduled.ownTag.asInternal();

            const thought = new Note(`Adding this tag to a note marks that the note contains thoughts previously had on a particular subject.`)
                .in(commonSpace).setOwnTag(this.thought);
            thought.ownTag.asInternal();
            
            await notu.saveNotes([
                address,
                cancelled,
                category,
                duration,
                finished,
                generated,
                ignore,
                info,
                journal,
                memory,
                pinned,
                scheduled,
                thought
            ]);
            
            const page1 = new Page();
            page1.name = 'Page 1';
            page1.order = 1;
            page1.group = 'Pages';
            page1.space = commonSpace;
            page1.query = `t.isInternal`;
            await notu.savePage(page1);
            
            const page2 = new Page();
            page2.name = 'Page 2';
            page2.order = 2;
            page2.group = 'Pages';
            page2.space = commonSpace;
            page2.query = `#Info`;
            await notu.savePage(page2);
            
            const page3 = new Page();
            page3.name = 'Page 3';
            page3.order = 3;
            page3.group = null;
            page3.space = commonSpace;
            page3.query = `#Thought`;
            await notu.savePage(page3);
        }
    }
}