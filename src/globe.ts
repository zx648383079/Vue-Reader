import { getCurrentInstance, inject, type App } from "vue";
import { EventEmitter, type IEventEmitter } from "./services/event";

export class GlobalSingleton extends EventEmitter implements IEventEmitter {

    constructor() {
        super();
    }

    private items: {
        [key: string]: any
    } = {};

    public reload() {
        this.items = [];
        this.listeners = {};
    }

    public has(key: Symbol | string): boolean {
        return Object.prototype.hasOwnProperty.call(this.items, key.toString());
    }

    public inject<T>(key: Symbol | string, defFn: () => T): T;
    public inject<T>(key: Symbol | string, def: T): T;
    public inject<T>(key: Symbol | string, def: T | (() => T)): T  {
        let instance = getCurrentInstance() ? inject<T>(key, undefined as any) : undefined;
        if (instance) {
            return instance;
        }
        instance = this.items[key.toString()];
        if (instance) {
            return instance;
        }
        instance = typeof def === 'function' ? (def as Function)() : def;
        this.provide(key, instance);
        return instance as T;
    }

    public provide<T>(key: Symbol | string, value: T): this;
    public provide<T>(key: Symbol | string, value: T, app: App): this;
    public provide<T>(key: Symbol | string, value: T, app?: App): this {
        if (app) {
            app.provide<T>(key, value);
        }
        this.items[key.toString()] = value;
        return this;
    }
}

export const globalSingleton = new GlobalSingleton();