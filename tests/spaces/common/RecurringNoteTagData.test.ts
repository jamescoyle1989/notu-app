import dayjs from 'dayjs';
import { NoteTag, Space, Tag } from 'notu';
import { expect, test } from 'vitest';
import { CommonSpaceSetup } from '../../../spaces/common/CommonSpaceSetup';
import { RecurringData } from '../../../spaces/common/RecurringNoteTagData';

const commonSpace = new Space('Common');
commonSpace.internalName = CommonSpaceSetup.internalName;
commonSpace.clean();

const recurringTag = new Tag(CommonSpaceSetup.recurring)
    .in(commonSpace).clean();

function newDate(val: string): Date {
    return dayjs(val).toDate();
}


test('isDueOn can enforce minDaysBetween', () => {
    const recurring = new RecurringData(new NoteTag(recurringTag));
    recurring.minDaysBetween = 3;
    const day = newDate('2024-07-17T12:00:00');
        
    expect(
        recurring.isDueOn(day, [newDate('2024-07-13T12:00:00')])
    ).toBe(true);
        
    expect(
        recurring.isDueOn(day, [newDate('2024-07-14T12:00:00')])
    ).toBe(true);
        
    expect(
        recurring.isDueOn(day, [newDate('2024-07-14T23:59:00')])
    ).toBe(true);

    expect(
        recurring.isDueOn(day, [newDate('2024-07-15T00:00:00')])
    ).toBe(false);
});


test('isDueOn can enforce daysPerCycle & timesPerCycle', () => {
    const recurring = new RecurringData(new NoteTag(recurringTag));
    recurring.minDaysBetween = 0;
    recurring.daysPerCycle = 5;
    recurring.timesPerCycle = 2;
    const day = newDate('2024-07-17T12:00:00');
        
    expect(
        recurring.isDueOn(day, [])
    ).toBe(true);
        
    expect(
        recurring.isDueOn(day, [newDate('2024-07-17T12:00:00')])
    ).toBe(true);
        
    expect(
        recurring.isDueOn(day, [
            newDate('2024-07-13T12:00:00'),
            newDate('2024-07-14T12:00:00')
        ])
    ).toBe(false);
        
    expect(
        recurring.isDueOn(day, [
            newDate('2024-07-13T00:00:00'),
            newDate('2024-07-14T12:00:00')
        ])
    ).toBe(false);
        
    expect(
        recurring.isDueOn(day, [
            newDate('2024-07-12T23:59:00'),
            newDate('2024-07-14T12:00:00')
        ])
    ).toBe(true);
        
    expect(
        recurring.isDueOn(day, [
            newDate('2024-07-12T12:00:00'),
            newDate('2024-07-14T12:00:00')
        ])
    ).toBe(true);
});


test('isDueOn can enforce daysOfWeek', () => {
    const recurring = new RecurringData(new NoteTag(recurringTag));
    recurring.minDaysBetween = 0;
    recurring.daysOfWeek = [1,3,5];
        
    expect( //Monday
        recurring.isDueOn(newDate('2024-07-15T00:00:00'), [])
    ).toBe(true);
        
    expect( //Tuesday
        recurring.isDueOn(newDate('2024-07-16T00:00:00'), [])
    ).toBe(false);
        
    expect( //Wednesday
        recurring.isDueOn(newDate('2024-07-17T23:59:00'), [])
    ).toBe(true);
        
    expect( //Thursday
        recurring.isDueOn(newDate('2024-07-18T23:59:00'), [])
    ).toBe(false);
});


test('isDueOn can enforce daysOfMonth', () => {
    const recurring = new RecurringData(new NoteTag(recurringTag));
    recurring.minDaysBetween = 0;
    recurring.daysOfMonth = [1,-1];
        
    expect(
        recurring.isDueOn(newDate('2024-07-01T23:59:00'), [])
    ).toBe(true);
        
    expect(
        recurring.isDueOn(newDate('2024-07-02T00:00:00'), [])
    ).toBe(false);
        
    expect(
        recurring.isDueOn(newDate('2024-07-30T23:59:00'), [])
    ).toBe(false);
        
    expect(
        recurring.isDueOn(newDate('2024-07-31T00:00:00'), [])
    ).toBe(true);
});


test('isDueOn can enforce monthsOfYear', () => {
    const recurring = new RecurringData(new NoteTag(recurringTag));
    recurring.minDaysBetween = 0;
    recurring.monthsOfYear = [1, 3];
        
    expect(
        recurring.isDueOn(newDate('2024-01-15T23:59:00'), [])
    ).toBe(true);
        
    expect(
        recurring.isDueOn(newDate('2024-02-15T00:00:00'), [])
    ).toBe(false);
        
    expect(
        recurring.isDueOn(newDate('2024-03-15T23:59:00'), [])
    ).toBe(true);
        
    expect(
        recurring.isDueOn(newDate('2024-04-15T00:00:00'), [])
    ).toBe(false);
});


test('isDueOn can enforce mix of constraints', () => {
    const recurring = new RecurringData(new NoteTag(recurringTag));
    recurring.monthsOfYear = [1, 3];
    recurring.daysOfMonth = [1, -1];
    recurring.daysOfWeek = [1, 3, 5];   // Monday, Wednesday, Friday
        
    expect( //Wednesday
        recurring.isDueOn(newDate('2025-01-01T12:00:00'), [])
    ).toBe(true);
        
    expect( //Friday
        recurring.isDueOn(newDate('2025-01-31T12:00:00'), [])
    ).toBe(true);
        
    expect(
        recurring.isDueOn(newDate('2025-02-01T12:00:00'), [])
    ).toBe(false);
    
    expect(
        recurring.isDueOn(newDate('2025-02-28T12:00:00'), [])
    ).toBe(false);
        
    expect( //Saturday
        recurring.isDueOn(newDate('2025-03-01T12:00:00'), [])
    ).toBe(false);
        
    expect( //Monday
        recurring.isDueOn(newDate('2025-03-31T12:00:00'), [])
    ).toBe(true);
});