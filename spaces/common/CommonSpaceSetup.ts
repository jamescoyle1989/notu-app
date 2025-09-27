import { Note, Notu, Page, Space } from "notu";

export class CommonSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.common'; }
    static get thought(): string { return 'Thought'; }
    static get info(): string { return 'Info'; }

    static async setup(notu: Notu): Promise<void> {
        let commonSpace = notu.getSpaceByInternalName(this.internalName);
        if (!commonSpace) {
            commonSpace = new Space('Common').v('1.0.0');
            commonSpace.internalName = this.internalName;
            await notu.saveSpace(commonSpace);

            const thought = new Note('This marks a note as being some thought that I\'ve had on a particular subject.')
                .in(commonSpace).setOwnTag(this.thought);
            thought.ownTag.asInternal();

            const info = new Note('This marks a note as being some info about a particular subject that may be useful later.')
                .in(commonSpace).setOwnTag(this.info);
            info.ownTag.asInternal();
            
            await notu.saveNotes([thought, info]);
            
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