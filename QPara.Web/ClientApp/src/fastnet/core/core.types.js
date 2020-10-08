"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Severity = exports.EnumValue = exports.ListItem = exports.DialogResult = void 0;
var DialogResult;
(function (DialogResult) {
    DialogResult[DialogResult["ok"] = 0] = "ok";
    DialogResult[DialogResult["cancel"] = 1] = "cancel";
})(DialogResult = exports.DialogResult || (exports.DialogResult = {}));
var ListItem = /** @class */ (function () {
    function ListItem() {
    }
    ListItem.prototype.toString = function () {
        return this.name;
    };
    return ListItem;
}());
exports.ListItem = ListItem;
// should EnumValue actually be called EnumItem???
var EnumValue = /** @class */ (function (_super) {
    __extends(EnumValue, _super);
    function EnumValue(val, name) {
        if (val === void 0) { val = 0; }
        if (name === void 0) { name = ""; }
        var _this = _super.call(this) || this;
        _this.value = val;
        _this.name = name;
        return _this;
    }
    EnumValue.prototype.toString = function () {
        return this.name;
    };
    return EnumValue;
}(ListItem));
exports.EnumValue = EnumValue;
var Severity;
(function (Severity) {
    Severity[Severity["trace"] = 0] = "trace";
    Severity[Severity["debug"] = 1] = "debug";
    Severity[Severity["information"] = 2] = "information";
    Severity[Severity["warning"] = 3] = "warning";
    Severity[Severity["error"] = 4] = "error";
})(Severity = exports.Severity || (exports.Severity = {}));
//# sourceMappingURL=core.types.js.map