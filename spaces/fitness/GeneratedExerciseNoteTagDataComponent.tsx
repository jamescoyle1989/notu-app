import { NotuSelect } from "@/components/NotuSelect";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode, useEffect, useState } from "react";
import { Label, XStack, YStack } from "tamagui";
import { ExerciseMetricDefData } from "./ExerciseMetricDefNoteTagData";
import { ExerciseMetricData } from "./ExerciseMetricNoteTagData";
import { FitnessSpace } from "./FitnessSpace";
import { GeneratedExerciseData } from "./GeneratedExerciseNoteTagData";

export default class GeneratedExerciseNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new GeneratedExerciseData(noteTag);
        return (<NotuText color={textColor} small>{data.description}</NotuText>)
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag}
                                 note={note}
                                 notu={notu}
                                 refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}



function EditorComponent({ noteTag, note, notu, refreshCallback }: NoteTagDataComponentProps) {
    const data = new GeneratedExerciseData(noteTag);
    const labelWidth = 150;
    const [defNote, setDefNote] = useState<Note>();
    const fitnessSpace = new FitnessSpace(notu);

    useEffect(() => {
        let running = true;
        fetch();
        return () => { running = false };

        async function fetch() {
            const defNoteResult = (await notu.getNotes(
                `n.id = ${noteTag.tag.id}`
            )).find(x => true);
            if (running)
                setDefNote(defNoteResult);
        }
    }, []);

    if (!defNote)
        return (<NotuText>Loading...</NotuText>);

    function onTargetDifficultyChange(value: any) {
        data.targetDifficulty = value;
        refreshCallback();
    }

    function onMetricValueChange(metricData: ExerciseMetricData, value: any) {
        metricData.value = value;
        refreshCallback();
    }

    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Difficulty</Label>
                <NotuSelect value={data.targetDifficulty}
                            options={[1, 2, 3, 4, 5, 6].map(x => ({
                                name: GeneratedExerciseData.valueToDescription(x),
                                value: x
                            }))}
                            onValueChange={onTargetDifficultyChange} />
            </XStack>

            {fitnessSpace.getMetrics(note).map((metricNT, index) => {
                const metricData = new ExerciseMetricData(metricNT);
                const metricDefData = new ExerciseMetricDefData(defNote.getTag(metricNT.tag));

                return (
                    <XStack key={index} style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>{metricNT.tag.name}</Label>
                        {!metricDefData && (
                            <NotuText>{metricData.value}</NotuText>
                        )}
                        {!!metricDefData && (
                            <NotuSelect value={metricData.value}
                                        options={metricDefData.getAllowedValues().map(x => ({ name: x.toString(), value: x }))}
                                        onValueChange={value => onMetricValueChange(metricData, value)} />
                        )}
                    </XStack>
                );
            })}
        </YStack>
    );
}