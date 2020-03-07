const monthNames: string[] = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];
export function noop(): void {

}
// converts a string date to one with time set to 00:00:00
// if null, returns today with time set to 00:00:00
export function getDateWithZeroTime(date: string | null): Date {
    let d = date === null ? new Date() : new Date(date);
    let cd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    //console.log(`getCleanDate(): ${date} converted to ${cd.toDateString()}`);
    return cd;
}

export function getMonthNames(): string[] {
    return monthNames;
}
// get date formatted as ddMMMyy
export function getDateAsddMMMyy(d: Date | string): string {
    if (d) {
        if (typeof d === "string") {
            d = getDateWithZeroTime(d);
        }
        var day = d.getDate();
        var monthIndex = d.getMonth();
        var year = d.getFullYear();
        let formattedDay = day.toString();
        if (day < 10) {
            formattedDay = "0" + formattedDay;
        }
        return formattedDay + monthNames[monthIndex].substr(0, 3) + year.toString().substr(2);
    }
    else {
        return "";
    }
}
export function addDays(date: Date, days: number) {
    let t = date.getTime() + (days * 24 * 60 * 60 * 1000);
    return new Date(t);
}
export function addMonths(date: Date, months: number) {
    let td = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    var d = td.getDate(); // get day of the month between 1 and 31
    td.setMonth(td.getMonth() + +months);
    if (td.getDate() != d) {
        td.setDate(0); // setDate(0) sets to the last of the previous month (isn't javascript wonderful??)
    }
    return td;
}
export function daysInMonth(date: Date): number {
    let d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return d.getDate();
}