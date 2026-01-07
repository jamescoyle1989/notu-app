import { last, orderBy } from "es-toolkit";
import { Note, NoteTag, Notu, Space, Tag } from "notu";
import { CommonSpace } from "../common/CommonSpace";
import { FinishedData } from "../common/FinishedNoteTagData";
import { ExerciseMetricDefData } from "./ExerciseMetricDefNoteTagData";
import { ExerciseMetricData } from "./ExerciseMetricNoteTagData";
import { FitnessSpace } from "./FitnessSpace";
import { FitnessSpaceSetup } from "./FitnessSpaceSetup";
import { GeneratedExerciseData } from "./GeneratedExerciseNoteTagData";
import { GenerateWorkoutProcessData } from "./GenerateWorkoutProcessNoteTagData";
import { WorkoutExerciseData } from "./WorkoutExerciseNoteTagData";

export class GenerateWorkoutProcessContext {
    private _notu: Notu;

    private _fitness: FitnessSpace;
    get fitnessSpace(): FitnessSpace { return this._fitness; }

    private _common: CommonSpace;
    get commonSpace(): CommonSpace { return this._common; }

    constructor(notu: Notu) {
        this._notu = notu;
        this._fitness = new FitnessSpace(notu);
        this._common = new CommonSpace(notu);
    }

    getWorkoutExerciseNTs(workout: Note): Array<NoteTag> {
        return workout.tags.filter(x => x.tag.linksTo(this._fitness.exercise));
    }

    async getWorkoutExerciseDefNotes(workout: Note): Promise<Array<Note>> {
        const nts = this.getWorkoutExerciseNTs(workout);
        if (nts.length == 0)
            return Promise.resolve([]);
        return await this._notu.getNotes(`
            n.id IN (${nts.map(x => x.tag.id).join(',')})
        `);
    }

    async getPreviousExercises(workout: Note): Promise<Array<Note>> {
        return await this._notu.getNotes(`
            _#[${this._fitness.exercise.getFullName()}] AND
            #[${this._common.generated.getFullName()}] AND
            #[${workout.ownTag.getFullName()}]
        `);
    }

    private _processData: GenerateWorkoutProcessData;
    private async _loadProcessData(): Promise<GenerateWorkoutProcessData> {
        try {
            if (!this._processData) {
                const processNote = (await this._notu.getNotes(
                    `@[${FitnessSpaceSetup.generateWorkoutProcess}]`,
                    this._fitness.space.id
                ))[0];
                this._processData = new GenerateWorkoutProcessData(
                    processNote.getTag(this.commonSpace.process)
                );
            }
            return this._processData;
        }
        catch {
            throw new Error(`Failed to load Generate Workout Process data`);
        }
    }
    async getSpaceToSaveExercisesTo(): Promise<Space> {
        const spaceId = (await this._loadProcessData()).saveExercisesToSpaceId;
        return this._notu.getSpace(spaceId);
    }
}


export async function generateWorkout(
    workout: Note,
    context: GenerateWorkoutProcessContext
): Promise<Map<Tag, Array<NewExerciseInfo>>> {

    const spaceToSaveExercisesTo = await context.getSpaceToSaveExercisesTo();
    if (!spaceToSaveExercisesTo) {
        throw new Error(`Check your Generate Workout Process configuration. It appears to be pointing to a non-existent space.`);
    }

    const exerciseNTs = context.getWorkoutExerciseNTs(workout);
    const exerciseDefs = await context.getWorkoutExerciseDefNotes(workout);
    const allPreviousExercises = await context.getPreviousExercises(workout);

    const output = new Map<Tag, Array<NewExerciseInfo>>();

    for (const nt of exerciseNTs) {
        const workoutExerciseData = new WorkoutExerciseData(nt);
        const exerciseDef = exerciseDefs.find(x => x.id == nt.tag.id);
        const previousExercises = orderBy(
            allPreviousExercises.filter(n => n.getTag(nt.tag)),
            [n => getExerciseFinishDate(n, context.commonSpace)],
            ['desc']
        );
        if (previousExercises.find(n => !n.getTag(context.commonSpace.finished)))
            continue;

        output.set(nt.tag, generateNextExerciseOptions(
            exerciseDef,
            workoutExerciseData,
            previousExercises,
            workout,
            context
        ))
    }

    return output;
}


export function getExerciseFinishDate(exercise: Note, commonSpace: CommonSpace): Date {
    const finishedData = FinishedData.new(exercise.getTag(commonSpace.finished));
    return finishedData?.date;
}


export function generateNextExerciseOptions(
    exerciseDef: Note,
    workoutExerciseData: WorkoutExerciseData,
    previousExercises: Array<Note>,
    workout: Note,
    context: GenerateWorkoutProcessContext
): Array<NewExerciseInfo> {

    const metrics = context.fitnessSpace.getMetrics(exerciseDef);
    const metricAllowedValues = new Map<Tag, Array<number>>();
    for (const metric of metrics) {
        metricAllowedValues.set(
            metric.tag,
            ExerciseMetricDefData.new(metric).getAllowedValues()
        );
    }

    const output = new Array<NewExerciseInfo>();

    if (previousExercises.length == 0) {
        output.push(generateFirstExercise(exerciseDef, metricAllowedValues, context.fitnessSpace, context.commonSpace));
    }
    else {
        const previousExercise = previousExercises[0];
        const previousExerciseData = GeneratedExerciseData.new(previousExercise.getTag(exerciseDef.ownTag));
        
        if (previousExerciseData.difficulty < workoutExerciseData.targetDifficulty) {
            output.push(...generateHigherDifficultyExercises(exerciseDef, previousExercise, metricAllowedValues, context.fitnessSpace, context.commonSpace));
            output.push(...generateSimilarDifficultyExercises(exerciseDef, previousExercise, metricAllowedValues, context.fitnessSpace, context.commonSpace));
        }
        else if (previousExerciseData.difficulty > workoutExerciseData.targetDifficulty) {
            output.push(...generateLowerDifficultyExercises(exerciseDef, previousExercise, metricAllowedValues, context.fitnessSpace, context.commonSpace));
            output.push(...generateSimilarDifficultyExercises(exerciseDef, previousExercise, metricAllowedValues, context.fitnessSpace, context.commonSpace));
        }
        else {
            output.push(...generateSimilarDifficultyExercises(exerciseDef, previousExercise, metricAllowedValues, context.fitnessSpace, context.commonSpace));
            output.push(...generateHigherDifficultyExercises(exerciseDef, previousExercise, metricAllowedValues, context.fitnessSpace, context.commonSpace));
            output.push(...generateLowerDifficultyExercises(exerciseDef, previousExercise, metricAllowedValues, context.fitnessSpace, context.commonSpace));
        }
    }

    for (const newExerciseInfo of output) {
        newExerciseInfo.note.addTag(workout.ownTag);
        const previousDuplicateExercise = getExerciseBeingRepeated(newExerciseInfo.note, previousExercises, context.fitnessSpace);
        if (!!previousDuplicateExercise) {
            const previousDuplicateExerciseData = GeneratedExerciseData.new(previousDuplicateExercise.getTag(exerciseDef.ownTag));
            if (previousDuplicateExerciseData.isFailed)
                newExerciseInfo.isRepeatOfFailure = true;
            else
                newExerciseInfo.isRepeatOfSuccess = true;
        }
    }
    return output;
}


export function getExerciseBeingRepeated(
    newExercise: Note,
    previousExercises: Array<Note>,
    fitnessSpace: FitnessSpace
): Note | null {
    const newMetricsDataMap = new Map<number, ExerciseMetricData>();
    for (const metric of fitnessSpace.getMetrics(newExercise))
        newMetricsDataMap.set(metric.tag.id, ExerciseMetricData.new(metric));

    for (const previousExercise of previousExercises) {
        const previousMetrics = fitnessSpace.getMetrics(previousExercise);
        if (previousMetrics.length != newMetricsDataMap.size)
            continue;
        let allMetricsTheSame = true;
        for (const previousMetric of previousMetrics) {
            const previousMetricData = ExerciseMetricData.new(previousMetric);
            const newMetricData = newMetricsDataMap.get(previousMetric.tag.id);
            if (Math.abs(previousMetricData.value - newMetricData.value) > Number.EPSILON) {
                allMetricsTheSame = false;
                break;
            }
        }
        if (allMetricsTheSame)
            return previousExercise;
    }
    return null;
}


export function generateFirstExercise(
    exerciseDef: Note,
    metricAllowedValues: Map<Tag, Array<number>>,
    fitnessSpace: FitnessSpace,
    commonSpace: CommonSpace
): NewExerciseInfo {
    const newNote = exerciseDef.duplicateAsNew();

    newNote.removeOwnTag();
    newNote.removeTag(fitnessSpace.exercise);
    GeneratedExerciseData.addTag(newNote, exerciseDef.ownTag).asEasy();

    for (const metric of fitnessSpace.getMetrics(newNote))
        newNote.removeTag(metric.tag);
    for (const [tag, allowedValues] of metricAllowedValues) {
        const metricData = ExerciseMetricData.addTag(newNote, tag);
        metricData.value = allowedValues[0];
    }

    newNote.addTag(commonSpace.generated);

    const output = new NewExerciseInfo();
    output.note = newNote;
    return output;
}


export function generateLowerDifficultyExercises(
    exerciseDef: Note,
    previousExercise: Note,
    metricAllowedValues: Map<Tag, Array<number>>,
    fitnessSpace: FitnessSpace,
    commonSpace: CommonSpace
): Array<NewExerciseInfo> {
    const output = new Array<NewExerciseInfo>();
    for (const [tag] of metricAllowedValues) {
        const newNote = generateExerciseVariation(
            exerciseDef,
            previousExercise,
            metricAllowedValues,
            fitnessSpace,
            commonSpace,
            null,
            tag
        );
        if (!!newNote)
            output.push(newNote);
    }
    return output;
}


export function generateHigherDifficultyExercises(
    exerciseDef: Note,
    previousExercise: Note,
    metricAllowedValues: Map<Tag, Array<number>>,
    fitnessSpace: FitnessSpace,
    commonSpace: CommonSpace
): Array<NewExerciseInfo> {
    const output = new Array<NewExerciseInfo>();
    for (const [tag] of metricAllowedValues) {
        const newNote = generateExerciseVariation(
            exerciseDef,
            previousExercise,
            metricAllowedValues,
            fitnessSpace,
            commonSpace,
            tag,
            null
        );
        if (!!newNote)
            output.push(newNote);
    }
    return output;
}


export function generateSimilarDifficultyExercises(
    exerciseDef: Note,
    previousExercise: Note,
    metricAllowedValues: Map<Tag, Array<number>>,
    fitnessSpace: FitnessSpace,
    commonSpace: CommonSpace
): Array<NewExerciseInfo> {
    const output = new Array<NewExerciseInfo>();
    output.push(generateExerciseVariation(
        exerciseDef,
        previousExercise,
        metricAllowedValues,
        fitnessSpace,
        commonSpace,
        null,
        null
    ));

    for (const [highTag] of metricAllowedValues) {
        for (const [lowTag] of metricAllowedValues) {
            if (highTag.id == lowTag.id)
                continue;
            const newNote = generateExerciseVariation(
                exerciseDef,
                previousExercise,
                metricAllowedValues,
                fitnessSpace,
                commonSpace,
                highTag,
                lowTag
            );
            if (!!newNote)
                output.push(newNote);
        }
    }
    return output;
}


export function generateExerciseVariation(
    exerciseDef: Note,
    previousExercise: Note,
    metricAllowedValues: Map<Tag, Array<number>>,
    fitnessSpace: FitnessSpace,
    commonSpace: CommonSpace,
    metricToIncrease: Tag | null,
    metricToDecrease: Tag | null
): NewExerciseInfo | null {
    const newNote = exerciseDef.duplicateAsNew();

    newNote.removeOwnTag();
    newNote.removeTag(fitnessSpace.exercise);
    const previousExerciseData = GeneratedExerciseData.new(previousExercise.getTag(exerciseDef.ownTag));
    const newExerciseData = GeneratedExerciseData.addTag(newNote, exerciseDef.ownTag);
    newExerciseData.difficulty = previousExerciseData.difficulty + (!!metricToIncrease ? 1 : 0) - (!!metricToDecrease ? 1 : 0);
    

    for (const metric of fitnessSpace.getMetrics(newNote))
        newNote.removeTag(metric.tag);
    for (const [tag, allowedValues] of metricAllowedValues) {
        const metricData = ExerciseMetricData.addTag(newNote, tag);

        const previousMetricData = ExerciseMetricData.new(previousExercise.getTag(tag));
        let bestDistance = Number.MAX_SAFE_INTEGER;
        let bestAllowedValueIndex = 0;
        for (let i = 0; i < allowedValues.length; i++) {
            const distance = Math.abs(allowedValues[i] - previousMetricData.value);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestAllowedValueIndex = i;
            }
        }
        
        if (tag === metricToIncrease) {
            if (bestAllowedValueIndex + 1 > allowedValues.length)
                return null;
            metricData.value = allowedValues[bestAllowedValueIndex + 1];
        }
        else if (tag === metricToDecrease) {
            if (bestAllowedValueIndex == 0)
                return null;
            metricData.value = allowedValues[bestAllowedValueIndex - 1];
        }
        else
            metricData.value = allowedValues[bestAllowedValueIndex];
    }

    newNote.addTag(commonSpace.generated);

    const output = new NewExerciseInfo();
    output.note = newNote;
    output.increasedMetric = metricToIncrease;
    if (!!metricToIncrease)
        output.invertIncreasedMetric = isArrayDescending(metricAllowedValues.get(metricToIncrease));
    output.decreasedMetric = metricToDecrease;
    if (!!metricToDecrease)
        output.invertDecreasedMetric = isArrayDescending(metricAllowedValues.get(metricToDecrease));
    return output;
}


function isArrayDescending(values: Array<number>): boolean {
    if (values.length < 2)
        return false;
    if (values[0] > last(values))
        return true;
    return false;
}


export class NewExerciseInfo {
    note: Note;
    increasedMetric: Tag | null;
    invertIncreasedMetric: boolean = false;
    decreasedMetric: Tag | null;
    invertDecreasedMetric: boolean = false;
    isRepeatOfSuccess: boolean = false;
    isRepeatOfFailure: boolean = false;
}