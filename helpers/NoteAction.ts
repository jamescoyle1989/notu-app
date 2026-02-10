import { Note } from "notu";
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

export class ShowNoteListAction extends UIAction {
    private _notes: Array<Note>;
    get notes(): Array<Note> { return this._notes; }

    private _title: string;
    get title(): string { return this._title; }

    private _customNoteViewer: (
        note: Note,
        notuRenderTools: NotuRenderTools,
        onUIAction: (action: UIAction) => void,
        customActions: (menuBuilder: NoteActionsMenuBuilder) => void
    ) => JSX.Element;
    get customNoteViewer(): (
        note: Note,
        notuRenderTools: NotuRenderTools,
        onUIAction: (action: UIAction) => void,
        customActions: (menuBuilder: NoteActionsMenuBuilder) => void
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
            customActions: (menuBuilder: NoteActionsMenuBuilder) => void
    ) => JSX.Element
    ) {
        super('ShowNoteList');
        this._notes = notes;
        this._title = title;
        this._customNoteViewer = customNoteViewer;
    }
}


export class NoteActionsMenuBuilder {
    private _actions: Array<NoteAction> = [];
    get actions(): Array<NoteAction> { return this._actions; }

    private _middleStartIndex = 0;
    private _endStartIndex = 0;

    addToTopOfStart(action: NoteAction) {
        this._removeActionsByName(action.name);
        this._actions.splice(0, 0, action);
        this._middleStartIndex++;
        this._endStartIndex++;
    }

    addToBottomOfStart(action: NoteAction) {
        this._removeActionsByName(action.name);
        this._actions.splice(this._middleStartIndex, 0, action);
        this._middleStartIndex++;
        this._endStartIndex++;
    }

    addToTopOfMiddle(action: NoteAction) {
        this._removeActionsByName(action.name);
        this._actions.splice(this._middleStartIndex, 0, action);
        this._endStartIndex++;
    }

    addToBottomOfMiddle(action: NoteAction) {
        this._removeActionsByName(action.name);
        this._actions.splice(this._endStartIndex, 0, action);
        this._endStartIndex++;
    }

    addToTopOfEnd(action: NoteAction) {
        this._removeActionsByName(action.name);
        this._actions.splice(this._endStartIndex, 0, action);
    }

    addToBottomOfEnd(action: NoteAction) {
        this._removeActionsByName(action.name);
        this._actions.push(action);
    }

    private _removeActionsByName(name: string) {
        for (let i = this._actions.length - 1; i >= 0; i--) {
            if (this._actions[i].name == name) {
                this._actions.splice(i, 1);
                if (i < this._endStartIndex)
                    this._endStartIndex--;
                if (i > this._middleStartIndex)
                    this._middleStartIndex--;
            }
        }
    }
}