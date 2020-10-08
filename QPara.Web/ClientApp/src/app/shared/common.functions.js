"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormattedDate = exports.getMonthNames = exports.getCleanDate = void 0;
function getCleanDate(date) {
    var d = date === null ? new Date() : new Date(date);
    var cd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    //console.log(`getCleanDate(): ${date} converted to ${cd.toDateString()}`);
    return cd;
}
exports.getCleanDate = getCleanDate;
var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];
function getMonthNames() {
    return monthNames;
}
exports.getMonthNames = getMonthNames;
function getFormattedDate(d) {
    if (d) {
        if (typeof d === "string") {
            d = getCleanDate(d);
        }
        var day = d.getDate();
        var monthIndex = d.getMonth();
        var year = d.getFullYear();
        var formattedDay = day.toString();
        if (day < 10) {
            formattedDay = "0" + formattedDay;
        }
        return formattedDay + monthNames[monthIndex].substr(0, 3) + year.toString().substr(2);
    }
    else {
        return "";
    }
}
exports.getFormattedDate = getFormattedDate;
//// now some extension methods
//// I haven't found a way of declaring them in their own separate file
//function exceptOld<T>(setB: Set<T>) {
//    let setA = this as Set<T>;
//    let _difference = new Set(setA);
//    for (let elem of setB) {
//        _difference.delete(elem)
//    }
//    return _difference;
//}
//# sourceMappingURL=common.functions.js.map