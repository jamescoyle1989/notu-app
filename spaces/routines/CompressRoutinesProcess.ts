import dayjs from "dayjs";
import { Note, NoteTag, Notu, Space, Tag } from "notu";
import { CancelledData } from "../common/CancelledNoteTagData";
import { CommonSpace } from "../common/CommonSpace";
import { FinishedData } from "../common/FinishedNoteTagData";
import { CompressRoutinesProcessData } from "./CompressRoutinesProcessNoteTagData";
import { RoutinesSpace } from "./RoutinesSpace";
import { RoutinesSpaceSetup } from "./RoutinesSpaceSetup";

export class CompressRoutinesProcessContext {
    private _notu: Notu;

    private _routines: RoutinesSpace;
    get routinesSpace(): RoutinesSpace { return this._routines; }
    
    private _common: CommonSpace;
    get commonSpace(): CommonSpace { return this._common; }

    constructor(notu: Notu) {
        this._notu = notu;
        this._routines = new RoutinesSpace(notu);
        this._common = new CommonSpace(notu);
    }

    async getCompressableRoutines(): Promise<Array<Tag>> {
        return (await this._notu.getNotes(`
            #[${this._routines.routine.getFullName()}]{.canBeCompressed = {True}}
            AND name IS NOT NULL
            AND NOT #[${this._common.ignore.getFullName()}]
        `)).map(x => x.ownTag);
    }

    async getFinishedRoutineTasks(): Promise<Array<Note>> {
        return await this._notu.getNotes(`
            _#[${this._routines.routine.getFullName()}]
            AND name IS NULL
            AND #[${this._common.generated.getFullName()}]
            AND #[${this._common.finished.getFullName()}]
        `);
    }

    async getCancelledRoutineTasks(): Promise<Array<Note>> {
        return await this._notu.getNotes(`
            _#[${this._routines.routine.getFullName()}]
            AND name IS NULL
            AND #[${this._common.generated.getFullName()}]
            AND #[${this._common.cancelled.getFullName()}]
        `);
    }
    
    private _processData: CompressRoutinesProcessData;
    private async _loadProcessData(): Promise<CompressRoutinesProcessData> {
        try {
            if (!this._processData) {
                const processNote = (await this._notu.getNotes(
                    `@[${RoutinesSpaceSetup.compressRoutinesProcess}]`,
                    this._routines.space.id
                ))[0];
                this._processData = new CompressRoutinesProcessData(
                    processNote.getTag(this.commonSpace.process)
                );
            }
            return this._processData;
        }
        catch {
            throw new Error(`Failed to load Compress Routines Process data`);
        }
    }
    async getSpaceToSaveNotesTo(): Promise<Space> {
        const spaceId = (await this._loadProcessData()).saveNotesToSpaceId;
        return this._notu.getSpace(spaceId);
    }
}


export async function compressRoutineTasks(
    context: CompressRoutinesProcessContext
): Promise<Array<Note>> {

    const spaceToSaveNotesTo = await context.getSpaceToSaveNotesTo();
    if (!spaceToSaveNotesTo) {
        throw new Error(`Check your Compress Routines Process configuration. It appears to be pointing to non-existent spaces.`);
    }

    const compressableRoutines = await context.getCompressableRoutines();

    const output = [];

    output.push(...compressRoutineTasksOfType(
        await context.getFinishedRoutineTasks(),
        compressableRoutines,
        n => getNoteFinishedDate(n, context.commonSpace),
        (n, d) => setNoteFinishedDate(n, context.commonSpace, d),
        context,
        spaceToSaveNotesTo
    ));

    output.push(...compressRoutineTasksOfType(
        await context.getCancelledRoutineTasks(),
        compressableRoutines,
        n => getNoteCancelledDate(n, context.commonSpace),
        (n, d) => setNoteCancelledDate(n, context.commonSpace, d),
        context,
        spaceToSaveNotesTo
    ));

    return output;
}


export function compressRoutineTasksOfType(
    tasks: Array<Note>,
    compressableRoutines: Array<Tag>,
    noteDateGetter: (n: Note) => Date,
    noteDateSetter: (n: Note, d: Date) => void,
    context: CompressRoutinesProcessContext,
    spaceToSaveNotesTo: Space
): Array<Note> {
    const output = [];

    for (const [time, notes] of groupNotesByDate(
        tasks,
        noteDateGetter,
        compressableRoutines
    )) {
        output.push(...compressNotesForDate(
            notes,
            new Date(time),
            noteDateSetter,
            context.commonSpace,
            context.routinesSpace,
            spaceToSaveNotesTo
        ));
    }

    return output;
}


export function groupNotesByDate(
    notes: Array<Note>,
    noteDateGetter: (note: Note) => Date,
    compressableRoutines: Array<Tag>
): Map<number, Array<Note>> {

    const output = new Map<number, Array<Note>>();

    for (const note of notes) {
        if (!compressableRoutines.find(t => !!note.getTag(t)))
            continue;

        const date = noteDateGetter(note);
        const time = dayjs(date).startOf('day').add(12, 'hours').toDate().getTime();
        if (output.has(time))
            output.get(time).push(note);
        else
            output.set(time, [note]);
    }

    return output;
}


export function compressNotesForDate(
    notes: Array<Note>,
    date: Date,
    noteDateSetter: (note: Note, date: Date) => void,
    commonSpace: CommonSpace,
    routinesSpace: RoutinesSpace,
    spaceToSaveNotesTo: Space
): Array<Note> {

    if (notes.length <= 1)
        return [];  // Nothing to compress, no saves to be made

    const compressedNote = notes[0];
    compressedNote.removeTag(commonSpace.scheduled);
    compressedNote.space = spaceToSaveNotesTo;
    noteDateSetter(compressedNote, date);
    for (let i = 1; i < notes.length; i++) {
        const otherNote = notes[i];
        for (const nt of getRoutineTagsOnNote(otherNote, routinesSpace))
            compressedNote.addTag(nt.tag);
        otherNote.delete();
    }
    return notes;
}


function getNoteFinishedDate(note: Note, commonSpace: CommonSpace): Date {
    const finished = new FinishedData(note.getTag(commonSpace.finished));
    return finished.date;
}

function setNoteFinishedDate(note: Note, commonSpace: CommonSpace, date: Date): void {
    const finished = new FinishedData(note.getTag(commonSpace.finished));
    finished.date = date;
}


function getNoteCancelledDate(note: Note, commonSpace: CommonSpace): Date {
    const cancelled = new CancelledData(note.getTag(commonSpace.cancelled));
    return cancelled.date;
}

function setNoteCancelledDate(note: Note, commonSpace: CommonSpace, date: Date): void {
    const cancelled = new CancelledData(note.getTag(commonSpace.cancelled));
    cancelled.date = date;
}


function getRoutineTagsOnNote(routine: Note, routinesSpace: RoutinesSpace): Array<NoteTag> {
    return routine.tags.filter(x => x.tag.linksTo(routinesSpace.routine));
}