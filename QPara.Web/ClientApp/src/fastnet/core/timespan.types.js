"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isEmpty(n) {
    return n === undefined || n === null || n === 0 || isNaN(n);
}
exports.msMinutes = 60000;
exports.msSeconds = 1000;
exports.msHours = 3600000;
exports.msDays = 24 * exports.msHours;
/**
 * This is due to performance reason, copied from Source of TimeSpan from C# code.
 */
var daysPerMS = 1 / exports.msDays;
var hoursPerMS = 1 / exports.msHours;
var minutesPerMS = 1 / exports.msMinutes;
var secondsPerMS = 1 / exports.msSeconds;
function padLeft(n, c, t) {
    if (c === void 0) { c = 2; }
    if (t === void 0) { t = "0"; }
    var s = n.toString();
    if (s.length < c) {
        s = t + s;
    }
    return s;
}
var TimeSpan = /** @class */ (function () {
    function TimeSpan(days, hours, minutes, seconds, milliseconds) {
        if (arguments.length === 1) {
            this.msSinceEpoch = days;
        }
        else {
            this.msSinceEpoch =
                (days || 0) * exports.msDays +
                    (hours || 0) * exports.msHours +
                    (minutes || 0) * exports.msMinutes +
                    (seconds || 0) * exports.msSeconds +
                    (milliseconds || 0);
        }
    }
    TimeSpan.fromDays = function (n) {
        return new TimeSpan(n * exports.msDays);
    };
    TimeSpan.fromHours = function (n) {
        return new TimeSpan(n * exports.msHours);
    };
    TimeSpan.fromMinutes = function (n) {
        return new TimeSpan(n * exports.msMinutes);
    };
    TimeSpan.fromSeconds = function (n) {
        return new TimeSpan(n * exports.msSeconds);
    };
    TimeSpan.fromMilliSeconds = function (n) {
        return new TimeSpan(n);
    };
    TimeSpan.parse = function (text) {
        if (!text) {
            throw new Error("Invalid time format");
        }
        var isPM = false;
        // tslint:disable-next-line: one-variable-per-declaration
        var d, h, m, s, ms;
        var tokens = text.split(/:/);
        // split last...
        var last = tokens[tokens.length - 1];
        var lastParts = last.split(" ");
        if (lastParts.length > 1) {
            if (/pm/i.test(lastParts[1])) {
                isPM = true;
            }
            tokens[tokens.length - 1] = lastParts[0];
        }
        var firstOfLast = lastParts[0];
        if (firstOfLast.indexOf(".") !== -1) {
            // it has ms...
            var secondParts = firstOfLast.split(".");
            if (secondParts.length > 1) {
                tokens[tokens.length - 1] = secondParts[0];
                ms = parseInt(secondParts[1], 10);
            }
        }
        if (tokens.length === 2) {
            // this is hour:min
            d = 0;
            h = parseInt(tokens[0], 10);
            m = parseInt(tokens[1], 10);
        }
        else if (tokens.length === 3) {
            d = 0;
            h = parseInt(tokens[0], 10);
            m = parseInt(tokens[1], 10);
            s = parseInt(tokens[2], 10);
        }
        else if (tokens.length === 4) {
            d = parseInt(tokens[0], 10);
            h = parseInt(tokens[1], 10);
            m = parseInt(tokens[2], 10);
            s = parseInt(tokens[3], 10);
        }
        return new TimeSpan(d, isPM ? h + 12 : h, m, s, ms);
    };
    Object.defineProperty(TimeSpan.prototype, "totalSeconds", {
        get: function () {
            return this.msSinceEpoch * secondsPerMS;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "totalMinutes", {
        get: function () {
            return this.msSinceEpoch * minutesPerMS;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "totalHours", {
        get: function () {
            return this.msSinceEpoch * hoursPerMS;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "totalDays", {
        get: function () {
            return this.msSinceEpoch * daysPerMS;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "totalMilliseconds", {
        get: function () {
            return this.msSinceEpoch;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "days", {
        get: function () {
            return Math.floor(this.msSinceEpoch / exports.msDays);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "hours", {
        get: function () {
            return Math.floor((this.msSinceEpoch / exports.msHours) % 24);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "minutes", {
        get: function () {
            return Math.floor((this.msSinceEpoch / exports.msMinutes) % 60);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "seconds", {
        get: function () {
            return Math.floor((this.msSinceEpoch / exports.msSeconds) % 60);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "milliseconds", {
        get: function () {
            return Math.floor(this.msSinceEpoch % 1000);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "duration", {
        /**
         * Duration is always positive TimeSpan
         */
        get: function () {
            var t = this.msSinceEpoch;
            return new TimeSpan(t > 0 ? t : -t);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeSpan.prototype, "trimmedTime", {
        /**
         * Removes days and only trims given TimeSpan to TimeOfDay
         */
        get: function () {
            return new TimeSpan(Math.ceil(this.msSinceEpoch % exports.msDays));
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Format the TimeSpan as time format
     * @param formatAs12 Display time as 12 hours with AM/PM (only if day is zero)
     */
    TimeSpan.prototype.toString = function (formatAs12) {
        if (formatAs12 === void 0) { formatAs12 = false; }
        var ams = this.msSinceEpoch;
        ams = Math.round((ams / 1000)) * 1000;
        var text = [];
        var postFix = "";
        function format(max, f12) {
            if (f12 === void 0) { f12 = false; }
            var txt = null;
            if (ams > max) {
                var n = Math.floor(ams / max);
                ams = ams % max;
                if (f12) {
                    if (n > 12) {
                        postFix = " PM";
                        txt = padLeft(n - 12);
                    }
                    else {
                        postFix = " AM";
                    }
                }
                if (!txt) {
                    txt = padLeft(n);
                }
            }
            if (txt) {
                text.push(txt);
            }
            return txt;
        }
        var d = format(exports.msDays);
        format(exports.msHours, formatAs12 && !d);
        format(exports.msMinutes);
        var s = format(exports.msSeconds);
        if (ams) {
            s += "." + ams;
            text[text.length - 1] = s;
        }
        var firstItem = text[0];
        if (firstItem[0] === "0") {
            text[0] = firstItem.substr(1);
        }
        return "" + text.join(":") + postFix;
    };
    TimeSpan.prototype.add = function (ts) {
        return new TimeSpan(this.msSinceEpoch + ts.msSinceEpoch);
    };
    TimeSpan.prototype.equals = function (ts) {
        return ts.msSinceEpoch === this.msSinceEpoch;
    };
    return TimeSpan;
}());
exports.default = TimeSpan;
if (typeof window !== "undefined") {
    window.TimeSpan = TimeSpan;
}
//# sourceMappingURL=timespan.types.js.map