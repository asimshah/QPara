import { EnumValue } from "./core.types";

export function delay(milliseconds: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

export function isNullorUndefinedorWhitespaceOrEmpty(value: any): boolean {
    return isNullorUndefined(value) || isWhitespaceOrEmpty(value);
}
/**
 * Tests that value is either null or defined
 * primarily used in validation methods
 * @param value value to test
 */
export function isNullorUndefined(value: any): boolean {
    return value === null || typeof value === "undefined";
}
/**
 * Tests if value is empty or all whitespace
 * primarily used in validation methods
 * @param value value to test
 */
export function isWhitespaceOrEmpty(value: string): boolean {
    let t = value.trim();
    return t.length == 0;
}
/**
 * Builds an array of EnumValue from an enum (for number enums only)
 * Used to generate EnumValue pairs for enum style controls
 * @param val
 */
export function toEnumValues(val: any): EnumValue[] {
    let list: EnumValue[] = [];
    const keys = Object.keys(val).filter(k => typeof val[k as any] === "number");
    const values = keys.map(k => val[k as any]);
    for (let i = 0; i < keys.length; ++i) {
        list.push({ name: keys[i], value: values[i] });
    }
    //console.log(`val is: ${JSON.stringify(list, null, 2)}`)
    return list;
}

/**
 * Use with an array in place of push() to insert or append based on provided compare function
 * @param array
 * @param item
 * @param compare
 */
export function sortedInsert<T>(array: T[], item: T, compare: (l: T, r: T) => number) {
    let inserted = false;
    for (let i = 0, len = array.length; i < len; ++i) {
        if (compare(item, array[i]) < 0) {
            array.splice(i, 0, item);
            inserted = true;
            break;
        }
    }
    if (!inserted) {
        array.push(item);
        inserted = true;
    } 
}

