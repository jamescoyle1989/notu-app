import dayjs from "dayjs";

export function dateToText(date: Date): string {
    return dayjs(date).format('YYYY-MMM-D');
}

export function timeToText(time: Date): string {
    return dayjs(time).format('HH:mm');
}

export function datetimeToText(datetime: Date): string {
    return dayjs(datetime).format('YYYY-MMM-D HH:mm');
}

export function timespanToText(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes - (totalHours * 60);
    const totalDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours - (totalDays * 24);

    let output = '';
    if (totalDays > 0)
        output = `${totalDays} day${totalDays > 1 ? 's' : ''}`
    if (remainingHours > 0 || remainingMinutes > 0 || (totalDays == 0 && remainingHours == 0 && remainingMinutes == 0))
        output += ` ${remainingHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
    return output;
}