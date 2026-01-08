import { NoteViewer } from "@/components/NoteViewer";
import { PreviousScreenAction, ShowNoteListAction, UIAction } from "@/helpers/NoteAction";
import { NotuRenderTools } from "@/helpers/NotuRenderTools";
import { NotuButton } from "@/helpers/NotuStyles";
import { Note, Notu, Tag } from "notu";
import { View, XStack } from "tamagui";
import { NewExerciseInfo } from "./GenerateWorkoutProcess";

export function showProcessOutputScreen(
    workout: Note,
    newExerciseOptions: Map<Tag, NewExerciseInfo[]>,
    notu: Notu
): UIAction {

    //Set up negative ids for all of the notes, these will act as unique keys when rendering
    let i = -1;
    for (const [tag, newExerciseInfos] of newExerciseOptions) {
        for (const newExerciseInfo of newExerciseInfos) {
            newExerciseInfo.note.id = i;
            i--;
        }
    }

    const displayNotes = new Array<Note>();
    for (const [tag, newExerciseInfos] of newExerciseOptions)
        displayNotes.push(newExerciseInfos[0].note);

    function handleChangeExercise(note: Note, onUIAction: (action: UIAction) => void) {
        for (const [tag, newExerciseInfos] of newExerciseOptions) {
            if (!!newExerciseInfos.find(x => x.note === note)) {
                onUIAction(showChangeExerciseScreen(tag));
                break;
            }
        }
    }

    function showChangeExerciseScreen(exerciseTag: Tag): ShowNoteListAction {
        const newExerciseInfos = newExerciseOptions.get(exerciseTag);
        for (const exerciseInfo of newExerciseInfos)
            exerciseInfo.note.group = getExeriseInfoSummaryText(exerciseInfo);
        const output = new ShowNoteListAction(
            newExerciseInfos.map(x => x.note),
            `${exerciseTag.name} options`,
            (
                note: Note,
                notuRenderTools: NotuRenderTools,
                onUIAction: (action: UIAction) => void
            ) => {
                return (
                    <XStack>
                        <View style={{alignSelf: 'flex-end', flexShrink: 1}}>
                            <NoteViewer note={note}
                                        notuRenderTools={notuRenderTools}
                                        onUIAction={onUIAction} />
                        </View>
                        <NotuButton theme="highlight" onPress={() => handleSelectExercise(exerciseTag, note, onUIAction)}>
                            Select
                        </NotuButton>
                    </XStack>
                );
            }
        );
        return output;
    }

    function getExeriseInfoSummaryText(exercise: NewExerciseInfo): string {
        let output = '';
        if (!!exercise.increasedMetric) {
            output += `${exercise.invertIncreasedMetric ? 'Less' : 'More'} ${exercise.increasedMetric.name}`
        }
        if (!!exercise.decreasedMetric) {
            if (!!exercise.increasedMetric)
                output += ', ';
            output += `${exercise.invertDecreasedMetric ? 'More' : 'Less'} ${exercise.decreasedMetric.name}`;
        }
        if (exercise.isRepeatOfFailure)
            output += ' (Previously failed)';
        else if (exercise.isRepeatOfSuccess)
            output += ' (Repeat)';
        return output.trim();
    }

    function handleSelectExercise(exerciseTag: Tag, note: Note, onUIAction: (action: UIAction) => void) {
        for (const exerciseInfo of newExerciseOptions.get(exerciseTag))
            exerciseInfo.note.group = undefined;
        for (let i = 0; i < displayNotes.length; i++) {
            const displayNote = displayNotes[i];
            if (!!displayNote.getTag(exerciseTag)) {
                displayNotes[i] = note;
                onUIAction(new PreviousScreenAction());
                break;
            }
        }
    }

    async function handleSaveExercises(onUIAction: (action: UIAction) => void) {
        await notu.saveNotes(displayNotes);
        onUIAction(new PreviousScreenAction());
    }

    const action = new ShowNoteListAction(
        displayNotes,
        `New exercises for ${workout.ownTag.name}`,
        (
            note: Note,
            notuRenderTools: NotuRenderTools,
            onUIAction: (action: UIAction) => void
        ) => {
            return (
                <XStack>
                    <View style={{alignSelf: 'flex-end', flexShrink: 1}}>
                        <NoteViewer note={note}
                                    notuRenderTools={notuRenderTools}
                                    onUIAction={onUIAction} />
                    </View>
                    <NotuButton theme="highlight" onPress={() => handleChangeExercise(note, onUIAction)}>
                        Change
                    </NotuButton>
                </XStack>
            );
        }
    );
    action.footer = (onUIAction: (action: UIAction) => void) => (
        <NotuButton theme="highlight" onPress={() => handleSaveExercises(onUIAction)}>Save</NotuButton>
    );
    return action;
}