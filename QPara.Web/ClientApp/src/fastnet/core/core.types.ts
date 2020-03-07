
export enum DialogResult {
    ok,
    cancel
}
export class ListItem<T> {
    value: T;
    name: string;
}
// should EnumValue actually be called EnumItem???
export class EnumValue extends ListItem<number> {
    constructor(val: number = 0, name: string = "") {
        super();
        this.value = val;
        this.name = name;
    }
}
export enum Severity {
    trace,
    debug,
    information,
    warning,
    error
}
export interface ILoggingService {
    trace(text: string): void;
    debug(text: string): void;
    information(text: string): void;
    warning(text: string): void;
    error(text: string): void;
}