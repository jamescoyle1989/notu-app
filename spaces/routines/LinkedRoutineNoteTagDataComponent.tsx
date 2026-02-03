import { NotuSelect } from "@/components/NotuSelect";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Label, View, XStack } from "tamagui";
import { LinkedRoutineData, RoutineRelationType } from "./LinkedRoutineNoteTagData";

export default class LinkedRoutineNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode {
        const data = new LinkedRoutineData(noteTag);
        return (
            <View>
                <NotuText>{data.relationship}</NotuText>
            </View>
        )
    }
    
    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new LinkedRoutineData(noteTag);
    }
}


function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new LinkedRoutineData(noteTag);

    const selectOptions: Array<RoutineRelationType> = [
        'Forces Routine Due',
        'Is Treated As Equivalent',
        'Must Be Due On Same Day',
        'Must Not Be Due On Same Day'
    ];

    function onRelationshipChange(newValue: RoutineRelationType) {
        data.relationship = newValue;
        refreshCallback();
    }

    return (
        <XStack style={{alignItems: 'center'}}>
            <Label width={120}>Relationship</Label>
            <NotuSelect options={selectOptions.map(x => ({ name: x, value: x }))}
                        value={data.relationship}
                        onValueChange={onRelationshipChange} />
        </XStack>
    )
}