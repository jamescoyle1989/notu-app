import { NoteActionsMenuBuilder } from "@/helpers/NoteAction";
import { Note, Notu, Space } from "notu";

/**
 * Represents a wrapper for a space that has some custom logic attached to it
 */
export interface LogicalSpace {
    get space(): Space;

    setup(notu: Notu): Promise<void>;

    buildNoteActionsMenu(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu);
}