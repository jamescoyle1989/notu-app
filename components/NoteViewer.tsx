import { NoteAction, UIAction } from '@/helpers/NoteAction';
import { NotuButton, NotuText } from '@/helpers/NotuStyles';
import { Note } from "notu";
import { useMemo, useState } from "react";
import { TouchableHighlight } from "react-native";
import { Dialog, XStack, YStack } from 'tamagui';
import { NotuRenderTools } from '../helpers/NotuRenderTools';
import { NoteComponentContainer } from './NoteComponentContainer';
import NoteTagBadge from './NoteTagBadge';


interface NoteViewerProps {
    note: Note,
    notuRenderTools: NotuRenderTools,
    onUIAction: (action: UIAction) => void
}


export const NoteViewer = ({
    note,
    notuRenderTools,
    onUIAction

}: NoteViewerProps) => {

    const textComponents = useMemo(() => notuRenderTools.noteTextSplitter(note), [note, note.text]);
    const [actions, setActions] = useState<Array<NoteAction>>(null);
    const [actionBeingConfirmed, setActionBeingConfirmed] = useState<NoteAction>();

    function showNoteActions() {
        const actionsList = notuRenderTools.buildNoteActionsMenu(note);
        if (actionsList.length == 0)
            return;
        setActions(actionsList);
    }

    function onActionPress(action: NoteAction) {
        if (action.requiresConfirmation)
            setActionBeingConfirmed(action);
        else
            onActionConfirmed(action);
    }

    async function onActionConfirmed(action: NoteAction) {
        const uiAction = await action.action(note);
        onUIAction(uiAction);
        hideOverlay();

    }

    function onActionCancelled(action: NoteAction) {
        setActionBeingConfirmed(undefined);
    }

    function hideOverlay() {
        setActions(null);
        setActionBeingConfirmed(undefined);
    }

    function renderAction(action: NoteAction, index: number) {
        if (actionBeingConfirmed !== action) {
            return (
                <NotuButton key={index}
                            onPress={() => onActionPress(action)}>
                    {action.name}
                </NotuButton>

            );
        }
        else {
            return (
                <YStack key={index}>
                    <NotuButton onPress={() => {}}>
                        {action.name}
                    </NotuButton>
                    <XStack>
                        <NotuButton success onPress={() => onActionConfirmed(action)}>
                            Confirm
                        </NotuButton>
                        <NotuButton danger onPress={() => onActionCancelled(action)}>
                            Cancel
                        </NotuButton>
                    </XStack>
                </YStack>
            );
        }
    }

    return (
        <TouchableHighlight onLongPress={showNoteActions}>
            
            <YStack>
                {textComponents.map((x, index) => (<NoteComponentContainer key={index} component={x}/>))}

                <Dialog modal open={actions != null}>
                    <Dialog.Portal>
                        <Dialog.Overlay key="notevieweractionsoverlay" onPress={() => hideOverlay()} />
                        <Dialog.FocusScope>
                            <Dialog.Content bordered elevate
                                            width="80%"
                                            key="notevieweractionscontent">
                                <NotuText bold underline>Available Actions</NotuText>
                                {(actions ?? []).map((x, index) => renderAction(x, index))}
                            </Dialog.Content>
                        </Dialog.FocusScope>
                    </Dialog.Portal>
                </Dialog>

                <XStack>
                    {note.tags.map(nt => (
                        <NoteTagBadge key={nt.tag.id}
                                    noteTag={nt} note={note}
                                    notuRenderTools={notuRenderTools}
                                    contextSpace={note.space}
                                    useUniqueName={true}/>
                    ))}
                </XStack>
            </YStack>
        </TouchableHighlight>
    )
};