import { PageData } from "@/spaces/system/PageNoteTagData";
import { SystemSpace } from "@/spaces/system/SystemSpace";
import { Note, Notu } from "notu";
import { JSX } from "react";
import { NotuRenderTools } from "./NotuRenderTools";

export class NoteAction {
    private _name: string;
    get name(): string { return this._name; }

    private _action: (note: Note) => Promise<UIAction>;
    get action(): (note: Note) => Promise<UIAction> { return this._action; }

    private _requiresConfirmation: boolean;
    get requiresConfirmation(): boolean { return this._requiresConfirmation; }

    public constructor(
        name: string,
        action: (note: Note) => Promise<UIAction>,
        requiresConfirmation: boolean = false
    ) {
        this._name = name;
        this._action = action;
        this._requiresConfirmation = requiresConfirmation;
    }
}

/**
 * Represents some intention that the app has for updating the UI as a result of an action being performed
 */
export class UIAction {
    private _name: string;
    get name(): string { return this._name; }

    constructor(name: string) {
        this._name = name;
    }
}

export class RefreshAction extends UIAction {
    constructor() {
        super('Refresh');
    }
}

export class ShowErrorAction extends UIAction {
    private _errorMessage: string;
    get errorMessage(): string { return this._errorMessage; }

    constructor(errorMessage: string) {
        super('ShowError');
        this._errorMessage = errorMessage;
    }
}

export class PreviousScreenAction extends UIAction {
    constructor() {
        super('PreviousScreen');
    }
}

export class ShowEditorAction extends UIAction {
    private _note: Note;
    get note(): Note { return this._note; }

    private _canEditSpace: boolean = true;
    get canEditSpace(): boolean { return this._canEditSpace; }

    private _canEditText: boolean = true;
    get canEditText(): boolean { return this._canEditText; }

    private _canEditOwnTag: boolean = true;
    get canEditOwnTag(): boolean { return this._canEditOwnTag; }

    private _canEditTags: boolean = true;
    get canEditTags(): boolean { return this._canEditTags; }

    constructor(note: Note) {
        super('Edit');
        this._note = note;
    }

    withPermissions(canEditSpace: boolean, canEditOwnTag: boolean, canEditText: boolean, canEditTags: boolean): ShowEditorAction {
        this._canEditSpace = canEditSpace;
        this._canEditOwnTag = canEditOwnTag;
        this._canEditText = canEditText;
        this._canEditTags = canEditTags;
        return this;
    }
}

export class ShowCustomPageAction extends UIAction {
    private _title: string;
    get title(): string { return this._title; }

    private _render: (onUIAction: (action: UIAction) => void) => React.JSX.Element;
    get render(): (onUIAction: (action: UIAction) => void) => React.JSX.Element {
        return this._render;
    }

    constructor(title: string, render: (onUIAction: (action: UIAction) => void) => React.JSX.Element) {
        super('ShowCustomPage');
        this._title = title;
        this._render = render;
    }
}

export class ShowDynamicPageAction extends UIAction {
    private _pageNote: Note;
    get pageNote(): Note { return this._pageNote; }

    private _pageData: PageData;
    get pageData(): PageData { return this._pageData; }

    constructor(pageNote: Note, notu: Notu) {
        super('ShowDynamicPage');
        const systemSpace = new SystemSpace(notu);
        const pageData = pageNote.getTagData(systemSpace.page, PageData);
        if (!pageData)
            throw Error('No page data found on the passed in note');
        this._pageNote = pageNote;
        this._pageData = pageData;
    }
}

export class ShowNoteListAction extends UIAction {
    private _notes: Array<Note>;
    get notes(): Array<Note> { return this._notes; }

    private _title: string;
    get title(): string { return this._title; }

    private _customNoteViewer: (
        note: Note,
        notuRenderTools: NotuRenderTools,
        onUIAction: (action: UIAction) => void,
        customActions: () => Array<NoteAction>
    ) => JSX.Element;
    get customNoteViewer(): (
        note: Note,
        notuRenderTools: NotuRenderTools,
        onUIAction: (action: UIAction) => void,
        customActions: () => Array<NoteAction>
    ) => JSX.Element {
        return this._customNoteViewer;
    }

    public header: (onUIAction: (action: UIAction) => void) => JSX.Element;

    public footer: (onUIAction: (action: UIAction) => void) => JSX.Element;

    constructor(
        notes: Array<Note>,
        title: string,
        customNoteViewer?: (
            note: Note,
            notuRenderTools: NotuRenderTools,
            onUIAction: (action: UIAction) => void,
            customActions: () => Array<NoteAction>
    ) => JSX.Element
    ) {
        super('ShowNoteList');
        this._notes = notes;
        this._title = title;
        this._customNoteViewer = customNoteViewer;
    }
}