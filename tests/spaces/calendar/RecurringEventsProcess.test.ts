import dayjs from "dayjs";
import { Note, Notu, NotuCache } from "notu";
import { expect, test } from "vitest";
import { getNewEventDates } from "../../../spaces/calendar/RecurringEventsProcess";
import { CommonSpace } from "../../../spaces/common/CommonSpace";
import { CommonSpaceSetup } from "../../../spaces/common/CommonSpaceSetup";
import { RecurringData } from "../../../spaces/common/RecurringNoteTagData";
import FakeNotuCacheFetcher from "../../../tests/testhelpers/FakeNotuCache";
import { FakeNotuClient } from "../../../tests/testhelpers/FakeNotuClient";

test('getNewEventDates doesnt create events that clash with existing ones', async () => {
    const cacheFetcher = new FakeNotuCacheFetcher();
    cacheFetcher.spacesData = [
        { id: 1, name: 'Common', internalName: CommonSpaceSetup.internalName }
    ];
    cacheFetcher.tagsData = [
        { id: 1, spaceId: 1, name: CommonSpaceSetup.scheduled, links: [] },
        { id: 2, spaceId: 1, name: CommonSpaceSetup.recurring, links: [] }
    ];

    const notu = new Notu(
        new FakeNotuClient(),
        new NotuCache(cacheFetcher)
    );
    await notu.cache.populate();

    const commonSpace = new CommonSpace(notu);

    const gamesNightNote = new Note().setOwnTag('Games Night');
    gamesNightNote.id = 10;
    gamesNightNote.ownTag.clean();

    const gamesNightRecurrence = RecurringData.addTag(gamesNightNote, commonSpace);
    gamesNightRecurrence.daysOfMonth = [1];
    gamesNightRecurrence.timeOfDay = dayjs().startOf('day').add(12, 'hours').add(30, 'minutes').toDate();
    gamesNightRecurrence.daysLookahead = 60;

    const newEventDates = getNewEventDates(
        gamesNightRecurrence,
        [dayjs().startOf('month').add(1, 'month').add(12, 'hours').add(30, 'minutes').toDate()]
    );

    expect(newEventDates.length).toBeGreaterThanOrEqual(1);
    expect(newEventDates[0])
        .toStrictEqual(dayjs().startOf('month').add(2, 'month').add(12, 'hours').add(30, 'minutes').toDate());
});