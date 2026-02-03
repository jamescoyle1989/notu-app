import { NotuSelect } from "@/components/NotuSelect";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Label, XStack } from "tamagui";
import { WorkoutExerciseData } from "./WorkoutExerciseNoteTagData";

export default class WorkoutExerciseNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new WorkoutExerciseData(noteTag);
        return (<NotuText color={textColor} small>{data.description}</NotuText>)
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new WorkoutExerciseData(noteTag);
    }
}



function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new WorkoutExerciseData(noteTag);

    function onTargetDifficultyChange(value: any) {
        data.targetDifficulty = value;
        refreshCallback();
    }

    return (
        <XStack style={{alignItems: 'center'}}>
            <Label>Target Difficulty</Label>
            <NotuSelect value={data.targetDifficulty}
                        options={[1, 2, 3, 4, 5].map(x => ({
                            name: WorkoutExerciseData.valueToDescription(x),
                            value: x
                        }))}
                        onValueChange={onTargetDifficultyChange} />
        </XStack>
    );
}