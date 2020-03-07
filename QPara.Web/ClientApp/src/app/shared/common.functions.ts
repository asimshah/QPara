
export function getCleanDate(date: string | null): Date {
    let d = date === null ? new Date() : new Date(date);
    let cd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    //console.log(`getCleanDate(): ${date} converted to ${cd.toDateString()}`);
    return cd;
}
const monthNames: string[] = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];
export function getMonthNames(): string[] {
    return monthNames;
}
export function getFormattedDate(d: Date | string): string {
    if (d) {
        if (typeof d === "string") {
            d = getCleanDate(d);
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
