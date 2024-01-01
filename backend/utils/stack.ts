export class Stack<T> {
    private top: StackItem<T> | null = null;
    private _size: number = 0;

    constructor() {
    }

    public push(v: T) {
        if (this._size == 0) {
            this.top = new StackItem<T>();
            this.top.value = v;
            ++this._size;
            return;
        }
        let app = new StackItem<T>();
        app.prev = this.top;
        app.value = v;
        this.top!.next = app;
        this.top = app;
        ++this._size;
    }

    public peek(): T | null {
        return this.top != null ? this.top.value : null;
    }

    public pop(): T | null {
        if (this._size == 0) {
            return null;
        }
        let returned = this.top!.value;
        this.top = this.top!.prev;
        this._size--
        if (this.top != null) {
            this.top.next = null;
        }
        return returned;
    }

    public get size() {
        return this._size;
    }
}

class StackItem<T> {
    prev: StackItem<T> | null = null;
    next: StackItem<T> | null = null;

    value: T|null = null;
}
