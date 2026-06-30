import { NoteViewer } from "@/components/NoteViewer";
import { PreviousScreenAction, RefreshAction, ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import { NotuRenderTools } from "@/helpers/NotuRenderTools";
import { NotuButton } from "@/helpers/NotuStyles";
import dayjs from "dayjs";
import { Note, Notu } from "notu";
import { View, XStack } from "tamagui";
import { CommonSpace } from "../common/CommonSpace";
import { FinishedData } from "../common/FinishedNoteTagData";
import { generateRoutines, GenerateRoutinesProcessContext } from "./GenerateRoutinesProcess";

export function showOverdueRoutinesScreen(
    overdueRoutineTasks: Array<Note>,
    notu: Notu,
    processContext: GenerateRoutinesProcessContext
): UIAction {
    
    const noteActions = new Map<number, 'Carry Forward' | 'Complete'>();
    for (const note of overdueRoutineTasks)
        noteActions.set(note.id, 'Carry Forward');

    function handleToggleRoutineAction(
        note: Note,
        onUIAction: (action: UIAction) => void
    ): void {
        const noteAction = noteActions.get(note.id);
        if (noteAction == 'Carry Forward')
            noteActions.set(note.id, 'Complete');
        else
            noteActions.set(note.id, 'Carry Forward');
        onUIAction(new RefreshAction());
    }

    async function handleConfirmClick(onUIAction: (action: UIAction) => void) {
        const notesToSave = new Array<Note>();
        const commonSpace = new CommonSpace(notu);
        for (const note of overdueRoutineTasks) {
            if (noteActions.get(note.id) != 'Complete')
                continue;
            note.removeTag(commonSpace.scheduled);
            const finished = FinishedData.addTag(note, commonSpace);
            finished.date = dayjs().startOf('day').subtract(1, 'minute').toDate();
            notesToSave.push(note);
        }
        await notu.saveNotes(notesToSave);
        
        const newNotes = await generateRoutines(processContext);
        await notu.saveNotes(newNotes);
        
        onUIAction(new PreviousScreenAction());
    }

    const action = new ShowNoteListAction(
        overdueRoutineTasks,
        `Overdue routines`,
        (
            note: Note,
            notuRenderTools: NotuRenderTools,
            onUIAction: (action: UIAction) => void
        ) => {
            return (
                <XStack style={{alignItems: 'center'}}>
                    <View style={{flexGrow: 1, flexShrink: 1}}>
                        <NoteViewer note={note}
                                    notuRenderTools={notuRenderTools}
                                    onUIAction={onUIAction} />
                    </View>
                    <NotuButton theme="highlight"
                                style={{flexBasis: 'auto'}}
                                onPress={() => handleToggleRoutineAction(note, onUIAction)}>
                        {noteActions.get(note.id)}
                    </NotuButton>
                </XStack>
            )
        }
    );
    action.footer = (onUIAction: (action: UIAction) => void) => (
        <NotuButton theme="highlight" onPress={() => handleConfirmClick(onUIAction)}>Confirm</NotuButton>
    );
    return action;
}