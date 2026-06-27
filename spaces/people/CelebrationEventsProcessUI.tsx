import { NoteViewer } from "@/components/NoteViewer";
import { NoteAction, PreviousScreenAction, RefreshAction, ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import { NotuRenderTools } from "@/helpers/NotuRenderTools";
import { NotuButton } from "@/helpers/NotuStyles";
import { Note, Notu } from "notu";

export function showGeneratedCelebrationEventsScreen(
    newEvents: Array<Note>,
    notu: Notu
): UIAction {

    //Set up negative ids for all of the notes, these will act as unique keys when rendering
    let i = -1;
    for (const newEvent of newEvents)
        newEvent.id = i--;

    async function handleSaveEvents(onUIAction: (action: UIAction) => void) {
        await notu.saveNotes(newEvents);
        onUIAction(new PreviousScreenAction());
    }

    const action = new ShowNoteListAction(
        newEvents,
        `New Celebration Events`,
        (
            note: Note,
            notuRenderTools: NotuRenderTools,
            onUIAction: (action: UIAction) => void
        ) => {

            function buildMenuItems(note: Note, notu: Notu): Array<NoteAction> {
                return [
                    new NoteAction('Delete', async n => {
                        note.delete();
                        return new RefreshAction();
                    })
                ];
            }

            return (
                <NoteViewer note={note}
                            key={note.id}
                            notuRenderTools={notuRenderTools}
                            customActions={buildMenuItems}
                            onUIAction={onUIAction} />
            )
        }
    );
    action.footer = (onUIAction: (action: UIAction) => void) => (
        <NotuButton theme="highlight"
                    onPress={() => handleSaveEvents(onUIAction)}
                    disabled={newEvents.length == 0}>
            Save
        </NotuButton>
    );
    return action;
}