import { Overlay } from '@rneui/base';
import { Note } from "notu";
import { useState } from "react";
import { Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import appStyles from '../helpers/AppStyles';


export class NoteViewerAction {
    private _name: string;
    get name(): string { return this._name; }

    private _action: (note: Note) => void;
    get action(): (note: Note) => void { return this._action; }

    private _requiresConfirmation: boolean;
    get requiresConfirmation(): boolean { return this._requiresConfirmation; }

    public constructor(
        name: string,
        action: (note: Note) => void,
        requiresConfirmation: boolean = false
    ) {
        this._name = name;
        this._action = action;
        this._requiresConfirmation = requiresConfirmation;
    }
}


interface NoteViewerProps {
    note: Note,
    actions: Array<NoteViewerAction>,
    showDate?: boolean
}


export const NoteViewer = ({
    note,
    actions,
    showDate = true
}: NoteViewerProps) => {

    const [showActions, setShowActions] = useState(false);
    const [actionBeingConfirmed, setActionBeingConfirmed] = useState<NoteViewerAction>();

    function showNoteActions() {
        if ((actions?.length ?? 0) == 0)
            return;
        setShowActions(true);
    }

    function onActionPress(action: NoteViewerAction) {
        if (action.requiresConfirmation)
            setActionBeingConfirmed(action);
        else
            onActionConfirmed(action);
    }

    function onActionConfirmed(action: NoteViewerAction) {
        action.action(note);
        hideOverlay();
    }

    function onActionCancelled(action: NoteViewerAction) {
        setActionBeingConfirmed(undefined);
    }

    function hideOverlay() {
        setShowActions(false);
        setActionBeingConfirmed(undefined);
    }

    function renderAction(action: NoteViewerAction, index: number) {
        if (actionBeingConfirmed !== action) {
            return (
                <TouchableOpacity key={index}
                                  style={[appStyles.button, appStyles.vMargin]}
                                  onPress={() => onActionPress(action)}>
                    <Text style={appStyles.whiteText}>{action.name}</Text>
                </TouchableOpacity>
            );
        }
        else {
            return (
                <View key={index}>
                    <TouchableOpacity style={[appStyles.button, appStyles.vMargin]}
                                      onPress={() => {}}>
                        <Text style={appStyles.whiteText}>{action.name}</Text>
                    </TouchableOpacity>
                    <View style={{
                        flexDirection: 'row'
                    }}>
                        <TouchableOpacity style={[appStyles.button, appStyles.success]}
                                          onPress={() => onActionConfirmed(action)}>
                            <Text style={appStyles.whiteText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[appStyles.button, appStyles.danger]}
                                          onPress={() => onActionCancelled(action)}>
                            <Text style={appStyles.whiteText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    }

    return (
        <TouchableHighlight onLongPress={showNoteActions}>
            
            <View>
                <Text style={appStyles.whiteText}>{note.text}</Text>

                <Overlay isVisible={showActions} onBackdropPress={() => hideOverlay()}>
                    <Text style={appStyles.whiteText}>Available Actions</Text>
                    {actions.map((x, index) => renderAction(x, index))}
                </Overlay>
            </View>
        </TouchableHighlight>
    )
};