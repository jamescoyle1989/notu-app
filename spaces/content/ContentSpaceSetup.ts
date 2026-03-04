import { Note, Notu, Space } from "notu";

export class ContentSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.content'; }
    static get medium(): string { return 'Medium'; }
    static get genre(): string { return 'Genre'; }
    static get rating(): string { return 'Rating'; }

    static async setup(notu: Notu): Promise<void> {
        let contentSpace = notu.getSpaceByInternalName(this.internalName);
        if (!contentSpace) {
            contentSpace = new Space('Content').v('1.0.0');
            contentSpace.internalName = this.internalName;
            await notu.saveSpace(contentSpace);

            const medium = new Note(`This tag defines a note as representing a particular medium, for example, Book, TV, Video Game. It's generally advisable to give each piece of content a medium so that it's more easily searchable.`)
                .in(contentSpace).setOwnTag(this.medium);
            medium.ownTag.asInternal();

            const genre = new Note(`This tag defines a note as representing a particular genre of entertainment, for example, Comedy, Horror, Sci-Fi. It's generally advisable to give each piece of content a medium so that it's more easily searchable.`)
                .in(contentSpace).setOwnTag(this.genre);
            genre.ownTag.asInternal();

            const rating = new Note(`Add this tag to a note to include a rating of enjoyment. A rating can given as a percentage, or as a fractional X/Y (for example 8.5/10). Newly added tags will automatically search for previous ratings to see what ratings basis they should use.`)
                .in(contentSpace).setOwnTag(this.rating);
            rating.ownTag.asInternal();

            await notu.saveNotes([medium, genre, rating]);
        }
    }
}