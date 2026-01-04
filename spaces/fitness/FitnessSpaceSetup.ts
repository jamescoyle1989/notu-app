import { Note, Notu, Page, Space } from "notu";
import { CommonSpace } from "../common/CommonSpace";
import { GenerateWorkoutProcessData } from "./GenerateWorkoutProcessNoteTagData";

export class FitnessSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.fitness'; }
    static get metric(): string { return 'Metric'; }
    static get workout(): string { return 'Workout'; }
    static get exercise(): string { return 'Exercise'; }
    static get generateWorkoutProcess(): string { return 'Generate Workout Process'; }

    static async setup(notu: Notu): Promise<void> {
        let fitnessSpace = notu.getSpaceByInternalName(this.internalName);
        if (!fitnessSpace) {
            fitnessSpace = new Space('Fitness').v('1.0.0');
            fitnessSpace.internalName = this.internalName;
            await notu.saveSpace(fitnessSpace);

            const metric = new Note(`Adding this tag to a note marks that the note represents some metric which we can measure exercises by. When a metric gets added to an exercise, the metric will define the range of values that it can take.`)
                .in(fitnessSpace).setOwnTag(this.metric);
            metric.ownTag.asInternal();

            const workout = new Note(`Adding this tag to a note marks that it represents a template for a workout. Add exercise tags to the note to define what exercises the workout generates.`)
                .in(fitnessSpace).setOwnTag(this.workout);
            workout.ownTag.asInternal();

            const exercise = new Note(`Adding this tag to a note marks that it represents the definition for an exercise. Add metric tags to the note to define how the exercise is measured. This will allow the system to help measure progress and suggest ways to continue growing.`)
                .in(fitnessSpace).setOwnTag(this.workout);
            exercise.ownTag.asInternal();

            await notu.saveNotes([
                metric,
                workout,
                exercise
            ]);

            const commonSpace = new CommonSpace(notu);

            const generateWorkoutProcess = new Note(`This process will automatically generate exercises for the selected workout. Once exercise suggestions have been generated, they will be displayed on screen so the user can confirm which exercise options they want to go with.`)
                .in(fitnessSpace).setOwnTag(this.generateWorkoutProcess)
            generateWorkoutProcess.ownTag.asInternal();
            const processData = GenerateWorkoutProcessData.addTag(generateWorkoutProcess, commonSpace);
            processData.saveExercisesToSpaceId = fitnessSpace.id;
            await notu.saveNotes([generateWorkoutProcess]);

            const internalsPage = new Page();
            internalsPage.name = 'Fitness Space Setup';
            internalsPage.order = 50;
            internalsPage.group = 'Fitness';
            internalsPage.space = fitnessSpace;
            internalsPage.query = `t.isInternal OR #Common.Process`;
            await notu.savePage(internalsPage);

            const metricsPage = new Page();
            metricsPage.name = 'Metrics';
            metricsPage.order = 51;
            metricsPage.group = 'Fitness';
            metricsPage.space = fitnessSpace;
            metricsPage.query = `#Fitness.Metric`;
            await notu.savePage(metricsPage);

            const exercisesPage = new Page();
            exercisesPage.name = 'Exercise Definitions';
            exercisesPage.order = 52;
            exercisesPage.group = 'Fitness';
            exercisesPage.space = fitnessSpace;
            exercisesPage.query = `#Fitness.Exercise`;
            await notu.savePage(exercisesPage);

            const workoutsPage = new Page();
            workoutsPage.name = 'Workouts';
            workoutsPage.order = 53;
            workoutsPage.group = 'Fitness';
            workoutsPage.space = fitnessSpace;
            workoutsPage.query = `#Fitness.Workout`;
            await notu.savePage(workoutsPage);

            const genExercisesPage = new Page();
            genExercisesPage.name = 'Generated Exercises';
            genExercisesPage.order = 54;
            genExercisesPage.group = 'Fitness';
            genExercisesPage.space = fitnessSpace;
            genExercisesPage.query = `_#Fitness.Exercise AND #Common.Generated AND _#Fitness.Workout`;
            await notu.savePage(genExercisesPage);
        }
    }
}