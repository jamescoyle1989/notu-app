import { NoteCalcProcessor } from '@/notecomponents/NoteCalc';
import { NoteChecklistProcessor } from '@/notecomponents/NoteChecklist';
import { NoteChoiceProcessor } from '@/notecomponents/NoteChoice';
import { NoteLinkProcessor } from '@/notecomponents/NoteLink';
import { CalendarSpaceSetup } from '@/spaces/calendar/CalendarSpaceSetup';
import RecurringEventsProcessNoteTagDataComponentFactory from '@/spaces/calendar/RecurringEventsProcessNoteTagDataComponent';
import AddressNoteTagDataComponentFactory from '@/spaces/common/AddressNoteTagDataComponent';
import CancelledNoteTagDataComponentFactory from '@/spaces/common/CancelledNoteTagDataComponent';
import { CommonSpaceSetup } from '@/spaces/common/CommonSpaceSetup';
import DurationNoteTagDataComponentFactory from '@/spaces/common/DurationNoteTagDataComponent';
import FinishedNoteTagDataComponentFactory from '@/spaces/common/FinishedNoteTagDataComponent';
import RecurringNoteTagDataComponentFactory from '@/spaces/common/RecurringNoteTagDataComponent';
import ScheduledNoteTagDataComponentFactory from '@/spaces/common/ScheduledNoteTagDataComponent';
import StartedNoteTagDataComponentFactory from '@/spaces/common/StartedNoteTagDataComponent';
import { ContentSpaceSetup } from '@/spaces/content/ContentSpaceSetup';
import RatingNoteTagDataComponentFactory from '@/spaces/content/RatingNoteTagDataComponent';
import ExerciseMetricDefNoteTagDataComponentFactory from '@/spaces/fitness/ExerciseMetricDefNoteTagDataComponent';
import ExerciseMetricNoteTagDataComponentFactory from '@/spaces/fitness/ExerciseMetricNoteTagDataComponent';
import ExerciseNoteTagDataComponentFactory from '@/spaces/fitness/ExerciseNoteTagDataComponent';
import { FitnessSpaceSetup } from '@/spaces/fitness/FitnessSpaceSetup';
import GeneratedExerciseNoteTagDataComponentFactory from '@/spaces/fitness/GeneratedExerciseNoteTagDataComponent';
import GenerateWorkoutProcessNoteTagDataComponentFactory from '@/spaces/fitness/GenerateWorkoutProcessNoteTagDataComponent';
import MetricNoteTagDataComponentFactory from '@/spaces/fitness/MetricNoteTagDataComponent';
import WorkoutExerciseNoteTagDataComponentFactory from '@/spaces/fitness/WorkoutExerciseNoteTagDataComponent';
import WorkoutNoteTagDataComponentFactory from '@/spaces/fitness/WorkoutNoteTagDataComponent';
import { FoodSpaceSetup } from '@/spaces/food/FoodSpaceSetup';
import GenerateMealProcessNoteTagDataComponentFactory from '@/spaces/food/GenerateMealProcessNoteTagDataComponent';
import GenerateShoppingListProcessNoteTagDataComponentFactory from '@/spaces/food/GenerateShoppingListProcessNoteTagDataComponent';
import IngredientFilterNoteTagDataComponentFactory from '@/spaces/food/IngredientFilterNoteTagDataComponent';
import MealNoteTagDataComponentFactory from '@/spaces/food/MealNoteTagDataComponent';
import RecipeNoteTagDataComponentFactory from '@/spaces/food/RecipeNoteTagDataComponent';
import AccountNoteTagDataComponentFactory from '@/spaces/money/AccountNoteTagDataComponent';
import BudgetCategoryNoteTagDataComponentFactory from '@/spaces/money/BudgetCategoryNoteTagDataComponent';
import BudgetNoteTagDataComponentFactory from '@/spaces/money/BudgetNoteTagDataComponent';
import CurrencyNoteTagDataComponentFactory from '@/spaces/money/CurrencyNoteTagDataComponent';
import ImportTransactionsProcessNoteTagDataComponentFactory from '@/spaces/money/ImportTransactionsProcessNoteTagDataComponent';
import { MoneySpaceSetup } from '@/spaces/money/MoneySpaceSetup';
import TransactionNoteTagDataComponentFactory from '@/spaces/money/TransactionNoteTagDataComponent';
import CelebrationEventsProcessNoteTagDataComponentFactory from '@/spaces/people/CelebrationEventsProcessNoteTagDataComponent';
import CelebrationNoteTagDataComponentFactory from '@/spaces/people/CelebrationNoteTagDataComponent';
import CircleNoteTagDataComponentFactory from '@/spaces/people/CircleNoteTagDataComponent';
import { PeopleSpaceSetup } from '@/spaces/people/PeopleSpaceSetup';
import PersonCelebrationNoteTagDataComponentFactory from '@/spaces/people/PersonCelebrationNoteTagDataComponent';
import PersonNoteTagDataComponentFactory from '@/spaces/people/PersonNoteTagDataComponent';
import CompressRoutinesProcessNoteTagDataComponentFactory from '@/spaces/routines/CompressRoutinesProcessNoteTagDataComponent';
import GenerateRoutinesProcessNoteTagDataComponentFactory from '@/spaces/routines/GenerateRoutinesProcessNoteTagDataComponent';
import LinkedRoutineNoteTagDataComponentFactory from '@/spaces/routines/LinkedRoutineNoteTagDataComponent';
import RoutineNoteTagDataComponentFactory from '@/spaces/routines/RoutineNoteTagDataComponent';
import { RoutinesSpaceSetup } from '@/spaces/routines/RoutinesSpaceSetup';
import CloneNoteProcessNoteTagDataComponentFactory from '@/spaces/system/CloneNoteProcessNoteTagDataComponent';
import CreateNoteProcessNoteTagDataComponentFactory from '@/spaces/system/CreateNoteProcessNoteTagDataComponent';
import CustomProcessNoteTagDataComponentFactory from '@/spaces/system/CustomProcessNoteTagDataComponent';
import EditNoteProcessNoteTagDataComponentFactory from '@/spaces/system/EditNoteProcessNoteTagDataComponent';
import PageNoteTagDataComponentFactory from '@/spaces/system/PageNoteTagDataComponent';
import ProcessAvailabilityNoteTagDataComponentFactory from '@/spaces/system/ProcessAvailabilityNoteTagDataComponent';
import ProcessNoteTagDataComponentFactory from '@/spaces/system/ProcessNoteTagDataComponent';
import { SystemSpaceSetup } from '@/spaces/system/SystemSpaceSetup';
import DeadlineNoteTagDataComponentFactory from '@/spaces/tasks/DeadlineNoteTagDataComponent';
import { TasksSpaceSetup } from '@/spaces/tasks/TasksSpaceSetup';
import { NotuSQLiteCacheFetcher } from '@/sqlite/NotuSQLiteCacheFetcher';
import { NotuSQLiteClient } from '@/sqlite/NotuSQLiteClient';
import { ExpoSQLiteConnection } from '@/sqlite/SQLiteConnection';
import * as SQLite from 'expo-sqlite';
import { Notu, NotuCache } from 'notu';
import { NotuRenderTools } from './NotuRenderTools';


let _renderTools: NotuRenderTools = null;


export async function setupNotu(): Promise<NotuRenderTools> {
    if (_renderTools != null)
        return _renderTools;

    const db = await SQLite.openDatabaseAsync('notu.db', { useNewConnection: true });

    const notuCache = new NotuCache(
        new NotuSQLiteCacheFetcher(
            async () => Promise.resolve(new ExpoSQLiteConnection(db))
        )
    );

    const notuVal = new Notu(
        new NotuSQLiteClient(
            async () => Promise.resolve(new ExpoSQLiteConnection(db)),
            notuCache
        ),
        notuCache
    );

    await notuVal.setup();
    await notuVal.cache.populate();

    const renderToolsVal = new NotuRenderTools(
        notuVal,
        [
            new NoteLinkProcessor(),
            new NoteChecklistProcessor(),
            new NoteChoiceProcessor(),
            new NoteCalcProcessor()
        ],
        [
            new CloneNoteProcessNoteTagDataComponentFactory(),
            new CreateNoteProcessNoteTagDataComponentFactory(),
            new CustomProcessNoteTagDataComponentFactory(),
            new EditNoteProcessNoteTagDataComponentFactory(),
            new PageNoteTagDataComponentFactory(),
            new ProcessAvailabilityNoteTagDataComponentFactory(),
            new ProcessNoteTagDataComponentFactory(),

            new AddressNoteTagDataComponentFactory(),
            new CancelledNoteTagDataComponentFactory(),
            new DurationNoteTagDataComponentFactory(),
            new FinishedNoteTagDataComponentFactory(),
            new RecurringNoteTagDataComponentFactory(),
            new ScheduledNoteTagDataComponentFactory(),
            new StartedNoteTagDataComponentFactory(),

            new RecurringEventsProcessNoteTagDataComponentFactory(),

            new RatingNoteTagDataComponentFactory(),

            new ExerciseMetricDefNoteTagDataComponentFactory(),
            new ExerciseMetricNoteTagDataComponentFactory(),
            new ExerciseNoteTagDataComponentFactory(),
            new GeneratedExerciseNoteTagDataComponentFactory(),
            new GenerateWorkoutProcessNoteTagDataComponentFactory(),
            new MetricNoteTagDataComponentFactory(),
            new WorkoutExerciseNoteTagDataComponentFactory(),
            new WorkoutNoteTagDataComponentFactory(),

            new GenerateMealProcessNoteTagDataComponentFactory(),
            new GenerateShoppingListProcessNoteTagDataComponentFactory(),
            new MealNoteTagDataComponentFactory(),
            new RecipeNoteTagDataComponentFactory(),
            new IngredientFilterNoteTagDataComponentFactory(),

            new AccountNoteTagDataComponentFactory(),
            new BudgetCategoryNoteTagDataComponentFactory(),
            new BudgetNoteTagDataComponentFactory(),
            new CurrencyNoteTagDataComponentFactory(),
            new ImportTransactionsProcessNoteTagDataComponentFactory(),
            new TransactionNoteTagDataComponentFactory(),

            new CelebrationEventsProcessNoteTagDataComponentFactory(),
            new CelebrationNoteTagDataComponentFactory(),
            new CircleNoteTagDataComponentFactory(),
            new PersonCelebrationNoteTagDataComponentFactory(),
            new PersonNoteTagDataComponentFactory(),

            new CompressRoutinesProcessNoteTagDataComponentFactory(),
            new GenerateRoutinesProcessNoteTagDataComponentFactory(),
            new LinkedRoutineNoteTagDataComponentFactory(),
            new RoutineNoteTagDataComponentFactory(),

            new DeadlineNoteTagDataComponentFactory()
        ]
    );
    await SystemSpaceSetup.setup(notuVal);
    await CommonSpaceSetup.setup(notuVal);
    await PeopleSpaceSetup.setup(notuVal);
    await TasksSpaceSetup.setup(notuVal);
    await CalendarSpaceSetup.setup(notuVal);
    await RoutinesSpaceSetup.setup(notuVal);
    await FitnessSpaceSetup.setup(notuVal);
    await MoneySpaceSetup.setup(notuVal);
    await FoodSpaceSetup.setup(notuVal);
    await ContentSpaceSetup.setup(notuVal);
    _renderTools = renderToolsVal;
    return _renderTools;
}


export function getNotu(): NotuRenderTools {
    if (_renderTools == null)
        throw Error('Notu has not yet been loaded, getNotu is invalid before that point.');
    return _renderTools;
}