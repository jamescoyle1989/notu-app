import dayjs from "dayjs";
import { Note, Notu, NotuCache, Tag } from "notu";
import { expect, test } from "vitest";
import { CommonSpace } from "../../../spaces/common/CommonSpace";
import { CommonSpaceSetup } from "../../../spaces/common/CommonSpaceSetup";
import { RecurringData } from "../../../spaces/common/RecurringNoteTagData";
import { ScheduledData } from "../../../spaces/common/ScheduledNoteTagData";
import { evaluatePotentialRoutineDueDate } from "../../../spaces/routines/GenerateRoutinesProcess";
import { RoutineRelationType } from "../../../spaces/routines/LinkedRoutineNoteTagData";
import FakeNotuCacheFetcher from "../../../tests/testhelpers/FakeNotuCache";
import { FakeNotuClient } from "../../../tests/testhelpers/FakeNotuClient";

test('evaluatePotentialRoutineDueDate can prevent note from happening because it must occur on same day as other', async () => {
    const cacheFetcher = new FakeNotuCacheFetcher();
    cacheFetcher.spacesData = [
        { id: 1, name: 'Common', internalName: CommonSpaceSetup.internalName }
    ];
    cacheFetcher.tagsData = [
        { id: 1, spaceId: 1, name: CommonSpaceSetup.recurring, links: [] },
        { id: 2, spaceId: 1, name: CommonSpaceSetup.scheduled, links: [] }
    ];

    const notu = new Notu(
        new FakeNotuClient(),
        new NotuCache(cacheFetcher)
    );
    await notu.cache.populate();

    const commonSpace = new CommonSpace(notu);
    
    const planMealsNote = new Note().setOwnTag('Plan Meals');
    planMealsNote.id = 3;
    planMealsNote.ownTag.clean();

    const groceriesNote = new Note();
    const groceriesRecurrence = new RecurringData(groceriesNote.addTag(commonSpace.recurring));
    groceriesRecurrence.daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
    groceriesRecurrence.daysLookahead = 5;

    const planMealsPendingTask = new Note();
    planMealsPendingTask.addTag(planMealsNote.ownTag);
    const planMealsSchedule = new ScheduledData(planMealsPendingTask.addTag(commonSpace.scheduled));
    planMealsSchedule.start = dayjs('2026-06-10 12:00:00.000').toDate();

    const depsMap = new Map<RoutineRelationType, Array<Tag>>();
    depsMap.set('Must Be Due On Same Day', [planMealsNote.ownTag]);

    expect(
        evaluatePotentialRoutineDueDate(
            dayjs('2026-06-09 12:00:00.000').toDate(),
            groceriesRecurrence,
            [],
            [planMealsPendingTask],
            depsMap,
            commonSpace
        )
    ).toBe(false);

    expect(
        evaluatePotentialRoutineDueDate(
            dayjs('2026-06-10 12:00:00.000').toDate(),
            groceriesRecurrence,
            [],
            [planMealsPendingTask],
            depsMap,
            commonSpace
        )
    ).toBe(true);
});