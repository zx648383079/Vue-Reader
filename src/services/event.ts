export interface IEventListeners {
    // 滚动
    scroll: (event: Event) => void,
}

export interface IEventEmitter {
    once<E extends keyof IEventListeners>(event: E, listener: IEventListeners[E]): void;
    on<E extends keyof IEventListeners>(event: E, listener: IEventListeners[E]): void;
    off<E extends keyof IEventListeners>(event: E, listener?: IEventListeners[E] | undefined): void;
    emit<E extends keyof IEventListeners>(event: E, ...eventObject: Parameters<IEventListeners[E]>): void;
}

export class EventEmitter implements IEventEmitter {
    private eventPairs: {
        [trigger: string]: string;
    } = {
    };

    protected listeners: {
        [key: string]: Function[];
    } = {};

    public once<E extends keyof IEventListeners>(event: E, listener: IEventListeners[E]): void;
    public once(event: string, cb: (...items: any[]) => void|boolean|Promise<any>): this;
    public once(event: string, cb: any) {
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            this.listeners[event] = [];
        }
        const func = (...items: any[]) => {
            cb(...items);
            this.off(event, func);
        };
        this.listeners[event].push(func);
        return this;
    }

    public on<E extends keyof IEventListeners>(event: E, listener: IEventListeners[E]): void;
    public on(event: string, cb: (...items: any[]) => void|boolean|Promise<any>): this;
    public on(event: string, cb: any) {
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(cb);
        return this;
    }

    public emit<E extends keyof IEventListeners>(event: E, ...eventObject: Parameters<IEventListeners[E]>): void;
    // public emit(event: string, ...items: any[]): this;
    public emit(event: string, ...items: any[]) {
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            return this;
        }
        const pair: any = this.eventPairs[event];
        const listeners = this.listeners[event];
        for (let i = listeners.length - 1; i >= 0; i--) {
            const cb = listeners[i];
            const res = cb(...items);
            //  允许事件不进行传递
            if (res === false) {
                break;
            }
            if (!res || !pair) {
                continue;
            }
            if (res instanceof Promise) {
                res.then(data => {
                    this.emit(pair, data);
                });
                continue;
            }
            this.emit(pair, res);
        }
        return this;
    }

    public off<E extends keyof IEventListeners>(event: E, listener?: IEventListeners[E] | undefined): void;
    public off(...events: string[]): this;
    public off(event: string, cb: Function): this;
    public off(...events: any[]) {
        if (events.length == 2 && typeof events[1] === 'function') {
            return this.offListener(events[0], events[1]);
        }
        for (const event of events) {
            delete this.listeners[event];
        }
        return this;
    }


    private offListener(event: string, cb: Function): this {
        if (!Object.prototype.hasOwnProperty.call(this.listeners, event)) {
            return this;
        }
        const items = this.listeners[event];
        for (let i = items.length - 1; i >= 0; i--) {
            if (items[i] === cb) {
                items.splice(i, 1);
            }
        }
        return this;
    }
}