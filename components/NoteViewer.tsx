import { NoteAction, NoteActionsMenuBuilder, UIAction } from '@/helpers/NoteAction';
import { NotuButton, NotuText } from '@/helpers/NotuStyles';
import { ProcessAvailabilityData } from '@/spaces/system/ProcessAvailabilityNoteTagData';
import { ProcessDataBase } from '@/spaces/system/ProcessNoteTagDataBaseClass';
import { SystemSpace } from '@/spaces/system/SystemSpace';
import { Tag } from '@tamagui/lucide-icons';
import { Note, Notu } from "notu";
import { useMemo, useState } from "react";
import { TouchableHighlight } from "react-native";
import { Dialog, useTheme, View, XStack, YStack } from 'tamagui';
import { NotuRenderTools } from '../helpers/NotuRenderTools';
import { NoteComponentContainer } from './NoteComponentContainer';
import NoteTagBadge from './NoteTagBadge';
import TagBadge from './TagBadge';


interface NoteViewerProps {
    note: Note,
    notuRenderTools: NotuRenderTools,
    onUIAction: (action: UIAction) => void,
    customActions?: (note: Note, menuBuilder: NoteActionsMenuBuilder, notu: Notu) => void
}


export const NoteViewer = ({
    note,
    notuRenderTools,
    onUIAction,
    customActions = null

}: NoteViewerProps) => {

    const textComponents = useMemo(() => notuRenderTools.noteTextSplitter(note), [note, note.text]);
    const [actions, setActions] = useState<Array<NoteAction>>(null);
    const [actionBeingConfirmed, setActionBeingConfirmed] = useState<NoteAction>();
    const theme = useTheme();

    async function showNoteActions() {
        const systemSpace = new SystemSpace(notuRenderTools.notu);
        const actionsList = new Array<NoteAction>();
        for (const process of (await notuRenderTools.notu.getNotes(`#System.Process AND _#System.Process AND #[System.Process Availability]`))) {
            const procAvailData = new ProcessAvailabilityData(process.getTag(systemSpace.processAvailability));
            const query = `n.id = ${note.id} AND (${procAvailData.query})`;
            try {
                if (procAvailData.query.trim() == '' || (await notuRenderTools.notu.getNoteCount(query)) > 0) {
                    for (const nt of process.tags.filter(x => x.tag.linksTo(systemSpace.process))) {
                        const factory = notuRenderTools.getComponentFactoryForNoteTag(nt.tag, process);
                        const dataObj = factory.getDataObject(nt) as ProcessDataBase;
                        actionsList.push(new NoteAction(dataObj.name, n => dataObj.runProcess(note, notuRenderTools.notu), false));
                    }
                }
            }
            catch {
            }
        }
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
                        <NotuButton theme="highlight"
                                    flex={1}
                                    joinedRight
                                    onPress={() => onActionConfirmed(action)}>
                            Confirm
                        </NotuButton>
                        <NotuButton theme="danger"
                                    flex={1}
                                    joinedLeft
                                    onPress={() => onActionCancelled(action)}>
                            Cancel
                        </NotuButton>
                    </XStack>
                </YStack>
            );
        }
    }

    return (
        <TouchableHighlight onLongPress={showNoteActions}
                            underlayColor={theme.backgroundHover.val}>
            
            <View borderBottomColor="$borderColor" borderBottomWidth={1} paddingBlockEnd={2}>

                <YStack marginStart={5} marginEnd={5}>
                    {textComponents.map((x, index) => (<NoteComponentContainer key={index} component={x}/>))}

                    <XStack flexWrap="wrap" marginBlockStart={1}>
                        {!!note.ownTag && ([
                            <TagBadge key="badge"
                                    tag={note.ownTag}
                                    notu={notuRenderTools.notu}
                                    contextSpace={note.space}
                                    marginBlockStart={1} />,
                            <Tag key="icon" size={15} marginEnd={5} />
                        ])}
                        {note.tags.map(nt => (
                            <NoteTagBadge key={nt.tag.id}
                                        noteTag={nt} note={note}
                                        notuRenderTools={notuRenderTools}
                                        contextSpace={note.space}
                                        marginInlineEnd={2}
                                        useUniqueName={true}
                                        marginBlock={1} />
                        ))}
                    </XStack>
                </YStack>

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
            </View>
        </TouchableHighlight>
    )
};