import { NoteViewer } from "@/components/NoteViewer";
import { NoteAction, NoteActionsMenuBuilder, PreviousScreenAction, RefreshAction, ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import { NotuRenderTools } from "@/helpers/NotuRenderTools";
import { NotuButton, NotuText } from "@/helpers/NotuStyles";
import { Note, Notu } from "notu";
import { YStack } from "tamagui";
import { NewTransaction } from "./ImportTransactionsProcess";
import { MoneySpace } from "./MoneySpace";
import { TransactionData } from "./TransactionNoteTagData";

export function showProcessOutputScreen(
    account: Note,
    newTransactions: Array<NewTransaction>,
    notu: Notu
): UIAction {

    const moneySpace = new MoneySpace(notu);

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


    function isReadyForSave(): boolean {
        for (const newTxn of newTransactions) {
            if (newTxn.potentialDuplicates.length > 0 && !newTxn.note.isDeleted)
                return false;
        }
        return true;
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

            function buildNewTransactionMenuItems(note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
                menuBuilder.addToTopOfStart(new NoteAction('Delete', async n => {
                    note.delete();
                    return new RefreshAction();
                }));
            }

            function buildPossibleDuplicateMenuItems(possibleDuplicate: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) {
                menuBuilder.addToTopOfStart(new NoteAction('Update Existing Transaction', async n => {
                    const noteData = note.getTagData(moneySpace.transaction, TransactionData);
                    const duplicateData = possibleDuplicate.getTagData(moneySpace.transaction, TransactionData);
                    if (possibleDuplicate.text == duplicateData.description)
                        possibleDuplicate.text = noteData.description;
                    duplicateData.description = noteData.description;
                    await notu.saveNotes([possibleDuplicate]);
                    note.delete();
                    return new RefreshAction();
                }));
                menuBuilder.addToBottomOfStart(new NoteAction('Delete Existing Transaction', async n => {
                    const noteData = note.getTagData(moneySpace.transaction, TransactionData);
                    const duplicateData = possibleDuplicate.getTagData(moneySpace.transaction, TransactionData);
                    await notu.saveNotes([possibleDuplicate.delete()]);
                    potentialDuplicatesMap.set(note.id, potentialDuplicatesMap.get(note.id).filter(x => x.id != possibleDuplicate.id));
                    return new RefreshAction();
                }));
            }

            return (
                <YStack>
                    <NoteViewer note={note}
                                notuRenderTools={notuRenderTools}
                                customActions={buildNewTransactionMenuItems}
                                onUIAction={onUIAction} />
                    
                    {potentialDuplicates.length > 0 && (
                        <YStack marginInlineStart={30}>
                            <NotuText bold>Potential duplicate of...</NotuText>
                            {potentialDuplicates.map(pd => (
                                <NoteViewer note={pd}
                                            key={pd.id}
                                            notuRenderTools={notuRenderTools}
                                            customActions={buildPossibleDuplicateMenuItems}
                                            onUIAction={onUIAction} />
                            ))}
                        </YStack>
                    )}
                </YStack>
            )
        }
    );
    action.footer = (onUIAction: (action: UIAction) => void) => (
        <NotuButton theme="highlight"
                    onPress={() => handleSaveTransactions(onUIAction)}
                    disabled={!isReadyForSave()}>
            Save
        </NotuButton>
    );
    return action;
}