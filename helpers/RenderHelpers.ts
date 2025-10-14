const _months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function dateToText(date: Date): string {
    return `${date.getFullYear()} ${_months[date.getMonth()]} ${date.getDate()}`;
}

export function timeToText(time: Date): string {
    return `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`;
}

export function datetimeToText(datetime: Date): string {
    return `${dateToText(datetime)} ${timeToText(datetime)}`;
}