import { NoteAction } from '@/helpers/NoteAction';
import { Overlay } from '@rneui/base';
import { Note } from "notu";
import { useMemo, useState } from "react";
import { Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { NotuRenderTools } from '../helpers/NotuRenderTools';
import s from '../helpers/NotuStyles';
import { NoteComponentContainer } from './NoteComponentContainer';
import NoteTagBadge from './NoteTagBadge';


interface NoteViewerProps {
    note: Note,
    notuRenderTools: NotuRenderTools,
    showDate?: boolean
}


export const NoteViewer = ({
    note,
    notuRenderTools,
    showDate = true
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

    function onActionConfirmed(action: NoteAction) {
        action.action(note);
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
                <TouchableOpacity key={index}
                                  style={[s.touch.button, s.margin.v3]}
                                  onPress={() => onActionPress(action)}>
                    <Text style={s.text.plain}>{action.name}</Text>
                </TouchableOpacity>
            );
        }
        else {
            return (
                <View key={index}>
                    <TouchableOpacity style={[s.touch.button, s.margin.v3]}
                                      onPress={() => {}}>
                        <Text style={s.text.plain}>{action.name}</Text>
                    </TouchableOpacity>
                    <View style={{
                        flexDirection: 'row'
                    }}>
                        <TouchableOpacity style={[s.touch.button, s.background.success]}
                                          onPress={() => onActionConfirmed(action)}>
                            <Text style={s.text.plain}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.touch.button, s.background.danger]}
                                          onPress={() => onActionCancelled(action)}>
                            <Text style={s.text.plain}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }

    return (
        <TouchableHighlight onLongPress={showNoteActions}>
            
            <View>
                {textComponents.map((x, index) => (<NoteComponentContainer key={index} component={x}/>))}

                <Overlay isVisible={actions != null} onBackdropPress={() => hideOverlay()}>
                    <Text style={s.text.plain}>Available Actions</Text>
                    {actions.map((x, index) => renderAction(x, index))}
                </Overlay>

                <View style={s.container.row}>
                    {note.tags.map(nt => (
                        <NoteTagBadge key={nt.tag.id}
                                    noteTag={nt} note={note}
                                    notuRenderTools={notuRenderTools}
                                    contextSpace={note.space}
                                    useUniqueName={true}/>
                    ))}
                </View>
            </View>
        </TouchableHighlight>
    )
};