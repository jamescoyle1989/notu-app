import { NoteViewer } from "@/components/NoteViewer";
import { PreviousScreenAction, ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import { NotuRenderTools } from "@/helpers/NotuRenderTools";
import { NotuButton, NotuText } from "@/helpers/NotuStyles";
import { Note, Notu } from "notu";
import { YStack } from "tamagui";
import { NewTransaction } from "./ImportTransactionsProcess";

export function showProcessOutputScreen(
    account: Note,
    newTransactions: Array<NewTransaction>,
    notu: Notu
): UIAction {

    //Set up negative ids for all of the notes, these will act as unique keys when rendering
    let i = -1;
    const potentialDuplicatesMap = new Map<number, Array<Note>>();
    for (const txn of newTransactions) {
        txn.note.id = i;
        potentialDuplicatesMap.set(i, txn.potentialDuplicates);
        i--;
    }


    async function handleSaveTransactions(onUIAction: (action: UIAction) => void) {
        await notu.saveNotes(newTransactions.map(x => x.note));
        onUIAction(new PreviousScreenAction());
    }


    const action = new ShowNoteListAction(
        newTransactions.map(x => x.note),
        `New transactions for ${account.ownTag.name}`,
        (
            note: Note,
            notuRenderTools: NotuRenderTools,
            onUIAction: (action: UIAction) => void
        ) => {
            const potentialDuplicates = potentialDuplicatesMap.get(note.id);

            return (
                <YStack>
                    <NoteViewer note={note}
                                notuRenderTools={notuRenderTools}
                                onUIAction={onUIAction} />
                    {potentialDuplicates.length > 0 && (
                        <YStack marginInlineStart={30}>
                            <NotuText bold>Potential duplicate of...</NotuText>
                            {potentialDuplicates.map(pd => (
                                <NoteViewer note={pd}
                                            notuRenderTools={notuRenderTools}
                                            onUIAction={onUIAction} />
                            ))}
                        </YStack>
                    )}
                </YStack>
            )
        }
    );
    action.footer = (onUIAction: (action: UIAction) => void) => (
        <NotuButton theme="highlight" onPress={() => handleSaveTransactions(onUIAction)}>
            Save
        </NotuButton>
    );
    return action;
}