import dayjs from "dayjs";
import { difference } from "es-toolkit";

export function dateToText(date: Date): string {
    return dayjs(date).format('YYYY-MMM-D');
}

export function timeToText(time: Date): string {
    return dayjs(time).format('HH:mm');
}

export function datetimeToText(datetime: Date): string {
    return dayjs(datetime).format('YYYY-MMM-D HH:mm');
}

export function timespanToText(milliseconds: number, showSeconds: boolean = false): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds - (totalMinutes * 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes - (totalHours * 60);
    const totalDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours - (totalDays * 24);

    if (totalDays + remainingHours + remainingMinutes == 0 && (!showSeconds || remainingSeconds == 0))
        return '00:00';

    let output = '';
    if (totalDays > 0)
        output = `${totalDays} day${totalDays > 1 ? 's' : ''}`;
    if (showSeconds) {
        if (remainingHours + remainingMinutes + remainingSeconds > 0) {
            if (output.length > 0)
                output += ' ';
            if (remainingHours > 0)
                output += `${remainingHours.toString().padStart(2, '0')}:`;
            output += `${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }
    else {
        if (remainingHours + remainingMinutes > 0) {
            if (output.length > 0)
                output += ' ';
            output += `${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
        }
    }
    return output;
}


export function areArraysDifferent(array1: Array<number> | null, array2: Array<number> | null): boolean {
    if ((array1 == null) != (array2 == null))
        return true;
    if (array1 == null && array2 == null)
        return false;
    if (array1.length != array2.length)
        return true;
    return (difference(array1, array2).length > 0);
}