import { Note, Notu, Space } from "notu";
import { SystemSpace } from "../system/SystemSpace";

export class FitnessSpaceSetup {
    static get internalName(): string { return 'com.decoyspace.notu.fitness'; }
    static get metric(): string { return 'Metric'; }
    static get workout(): string { return 'Workout'; }
    static get exercise(): string { return 'Exercise'; }
    static get generateWorkoutProcess(): string { return 'Generate Workout Exercises'; }

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
                .in(fitnessSpace).setOwnTag(this.exercise);
            exercise.ownTag.asInternal();

            await notu.saveNotes([
                metric,
                workout,
                exercise
            ]);

            const systemSpace = new SystemSpace(notu);

            const generateWorkoutProcess = new Note(`This process will automatically generate exercises for the selected workout. Once exercise suggestions have been generated, they will be displayed on screen so the user can confirm which exercise options they want to go with.`)
                .in(fitnessSpace).setOwnTag(this.generateWorkoutProcess);
            generateWorkoutProcess.ownTag.asInternal();
            generateWorkoutProcess.addTag(systemSpace.process);
            await notu.saveNotes([generateWorkoutProcess]);
        }
    }
}