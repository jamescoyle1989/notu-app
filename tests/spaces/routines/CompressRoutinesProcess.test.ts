import { Note, Notu, NotuCache, Tag } from "notu";
import { expect, test } from "vitest";
import { CommonSpace } from "../../../spaces/common/CommonSpace";
import { CommonSpaceSetup } from "../../../spaces/common/CommonSpaceSetup";
import { compressNotesForDate } from "../../../spaces/routines/CompressRoutinesProcess";
import { RoutinesSpace } from "../../../spaces/routines/RoutinesSpace";
import { RoutinesSpaceSetup } from "../../../spaces/routines/RoutinesSpaceSetup";
import FakeNotuCacheFetcher from "../../../tests/testhelpers/FakeNotuCache";
import { FakeNotuClient } from "../../../tests/testhelpers/FakeNotuClient";

test('compressNotesForDate will strip out all extraneous tags', async () => {
    // Arrange
    const cacheFetcher = new FakeNotuCacheFetcher();
    cacheFetcher.spacesData = [
        { id: 1, name: 'Common', internalName: CommonSpaceSetup.internalName },
        { id: 2, name: 'Routines', internalName: RoutinesSpaceSetup.internalName }
    ];
    cacheFetcher.tagsData = [
        { id: 1, spaceId: 1, name: CommonSpaceSetup.scheduled, links: [] },
        { id: 2, spaceId: 1, name: CommonSpaceSetup.finished, links: [] },
        { id: 3, spaceId: 1, name: CommonSpaceSetup.cancelled, links: [] },
        { id: 4, spaceId: 1, name: CommonSpaceSetup.generated, links: [] },
        { id: 5, spaceId: 1, name: CommonSpaceSetup.address, links: [] },
        { id: 6, spaceId: 2, name: RoutinesSpaceSetup.routine, links: [] }
    ];

    const notu = new Notu(
        new FakeNotuClient(),
        new NotuCache(cacheFetcher)
    );
    await notu.cache.populate();

    const commonSpace = new CommonSpace(notu);
    const routinesSpace = new RoutinesSpace(notu);

    const groceriesTag = new Tag('Groceries');
    groceriesTag.id = 10;
    groceriesTag.links.push(routinesSpace.routine);
    groceriesTag.clean();

    const planMealsTag = new Tag('Plan Meals');
    planMealsTag.id = 11;
    planMealsTag.links.push(routinesSpace.routine);
    planMealsTag.clean();

    const groceriesTask = new Note().in(commonSpace.space);
    groceriesTask.addTag(groceriesTag);
    groceriesTask.addTag(commonSpace.finished);
    groceriesTask.addTag(commonSpace.generated);
    groceriesTask.addTag(commonSpace.address);

    const planMealsTask = new Note().in(commonSpace.space);
    planMealsTask.addTag(planMealsTag);
    planMealsTask.addTag(commonSpace.finished);
    planMealsTask.addTag(commonSpace.generated);

    // Act
    const results = compressNotesForDate(
        [groceriesTask, planMealsTask],
        new Date(),
        (note, date) => { },
        commonSpace,
        routinesSpace,
        commonSpace.space
    );

    // Assert
    expect(results.length).toBe(2);
    expect(results[0].state).not.toBe('DELETED');
    expect(results[1].state).toBe('DELETED');
    expect(results[0].getTag(commonSpace.finished)).toBeTruthy();
    expect(results[0].getTag(commonSpace.generated)).toBeTruthy();
    expect(results[0].getTag(groceriesTag)).toBeTruthy();
    expect(results[0].getTag(planMealsTag)).toBeTruthy();
    expect(results[0].getTag(commonSpace.address)).toBeFalsy();
});