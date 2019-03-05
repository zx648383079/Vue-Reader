import { PluginObject } from 'vue';

declare module 'mint-ui' {
    interface IToast {
        close(): void
    }
    interface IToastOption {
        message: string,
        position?: string,
        duration?: number,
        clasName?: string,
        iconClass?: string
    }
    /**
     * 通知提示框
     * @param params
     */
    export function Toast(params: IToastOption| string): IToast

    interface IIndicatorOption {
        text: string,
        spinnerType?: string
    }

    interface IIndicator extends IToast {
        open(option?: IIndicatorOption| string): void
    }
    /**
     * 加载中。。。
     */
    export var Indicator: IIndicator

    interface IMessageBoxOption {
        title: string,
        message: string,
        showCancelButton?: boolean,
        showConfirmButton?: boolean,
        confirmButtonText?: string,
        confirmButtonHighlight?: boolean,
        confirmButtonClass?: string,
        cancelButtonText?: string,
        cancelButtonHighlight?: boolean,
        cancelButtonClass?: string,
        closeOnClickModal?: boolean,
        showInput?: boolean,
        inputType?: string,
        inputValue?: string,
        inputPlaceholder?: string
    }

    export function MessageBox(title: string| IMessageBoxOption, message?: string): any;

    export namespace MessageBox {
        export function alert(message: string, title?: string): Promise<any>;
        export function confirm(message: string, title?: string): Promise<any>;
        export function prompt(message: string, title?: string): Promise<{value: string, actions: any}>;
    }

    interface IComponent {
        name: string
    }

    export var Swipe: IComponent

    export var SwipeItem: IComponent

    export var Range: IComponent

    export var Lazyload: PluginObject<any>

    export var Header: IComponent

    export var Tabbar: IComponent

    export var TabItem: IComponent

    export var Navbar: IComponent

    export var Cell: IComponent
    /**
     * 加载样式图标
     */
    export var Spinner: IComponent
}
