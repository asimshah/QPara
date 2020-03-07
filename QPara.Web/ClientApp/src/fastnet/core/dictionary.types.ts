interface IDictionary<T> {
    [Key: string]: T;
}
export class Dictionary<T> {
    private items: IDictionary<T> = {};
    public count: number = 0;
    public add(key: string, item: T) {
        if (!this.containsKey(key)) {
            this.count++;
        }
        this.items[key] = item;
    }
    public item(key: string): T {
        return this.items[key];
    }
    public remove(key: string): T | null {
        if (this.containsKey(key)) {
            let val = this.items[key];
            delete this.items[key];
            this.count--;
            return val;
        }
        return null;
    }
    public containsKey(key: string) {
        return this.items.hasOwnProperty(key);
    }
    public keys(): string[] {
        var keySet: string[] = [];

        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                keySet.push(prop);
            }
        }

        return keySet;
    }

    public values(): T[] {
        var values: T[] = [];

        for (var prop in this.items) {
            if (this.items.hasOwnProperty(prop)) {
                values.push(this.items[prop]);
            }
        }

        return values;
    }
}