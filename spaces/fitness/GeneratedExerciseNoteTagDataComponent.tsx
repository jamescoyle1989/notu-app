import { NotuSelect } from "@/components/NotuSelect";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Label, XStack } from "tamagui";
import { GeneratedExerciseData } from "./GeneratedExerciseNoteTagData";

export default class GeneratedExerciseNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new GeneratedExerciseData(noteTag);
        return (<NotuText color={textColor} small>{data.description}</NotuText>)
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}



function EditorComponent({ noteTag, refreshCallback }: NoteTagDataComponentProps) {
    const data = new GeneratedExerciseData(noteTag);

    function onTargetDifficultyChange(value: any) {
        data.targetDifficulty = value;
        refreshCallback();
    }

    return (
        <XStack style={{alignItems: 'center'}}>
            <Label>Target Difficulty</Label>
            <NotuSelect value={data.targetDifficulty}
                        options={[1, 2, 3, 4, 5, 6].map(x => ({
                            name: GeneratedExerciseData.valueToDescription(x),
                            value: x
                        }))}
                        onValueChange={onTargetDifficultyChange} />
        </XStack>
    );
}