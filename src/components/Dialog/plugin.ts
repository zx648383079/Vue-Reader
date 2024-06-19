import { createApp, type App, type Plugin, type InjectionKey, nextTick, inject, getCurrentInstance} from "vue";
import DialogContainer from './DialogContainer.vue';
import type { IErrorResponse } from "../../api/model";
import type { AxiosError } from "axios";
import { globalSingleton } from "../../globe";

export const dialogInjectionKey: InjectionKey<string> = Symbol('dailog');

interface DialogOption {
    [key: string]: any;
    dialogId?: any;
    visible?: boolean;
    content?: string;   //内容
    closeAnimate?: boolean;
    target?: any;           // 载体 显示在那个内容上，默认全局, position 需要自己设置 relative、absolute、fixed
    onClosing?: () => any; // 关闭请求， 是否关闭， 返回false 为不关闭
}

export interface DialogTipOption extends DialogOption {
    time?: number;         //显示时间
    type: string;
}


export interface DialogConfirmOption extends DialogOption {
    title?: string;
    icon?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export interface IDialogSerive {
    error(message: string|IErrorResponse|AxiosError): void;
    warning(message: string|IErrorResponse|AxiosError): void;
    success(message: string): void;
    loading(message?: string): void;
    tip(content: string): void;
    tip(content: string, time: number): void;
    tip(option: DialogTipOption):  void;
    tip(option: string|DialogTipOption, time?: number): void;
    confirm(content: string): Promise<any>;
    confirm(content: string, onConfirm: () => void): void;
    confirm(option: DialogConfirmOption): Promise<any>;
    confirm(option: DialogConfirmOption|string, onConfirm?: () => void): Promise<any>|void;

    close(dialogId?: any): void;
}

class DialogSerive implements IDialogSerive {

    private guid = 0;
    private container: any;
    private readyFn?: Function;

    public ready(container: any) {
        this.container = container;
        if (this.readyFn) {
            this.readyFn();
            this.readyFn = undefined;
        }
    }    

    private formatError(error: string|IErrorResponse|AxiosError): string {
        if (typeof error != 'object') {
            return error;
        }
        if (error.response) {
            return (error as AxiosError<IErrorResponse>).response?.data?.message || error.message;
        }
        return (error as IErrorResponse).message;
    }

    public error(message: string|IErrorResponse|AxiosError) {
        this.createMessage({
            content: this.formatError(message),
            type: 'error'
        });
    }

    public warning(message: string|IErrorResponse|AxiosError) {
        this.createMessage({
            content: this.formatError(message),
            type: 'waining'
        });
    }

    public success(message: string) {
        this.createMessage({
            content: this.formatError(message),
            type: 'success'
        });
    }

    public tip(content: string): void;
    public tip(content: string, time: number): void;
    public tip(option: DialogTipOption): void;
    public tip(option: string|DialogTipOption, time = 2000) {
        const opt = typeof option === 'object' ? option : {
            content: option,
            time,
        };
        this.createMessage({
            content: opt.content,
            time: opt.time,
            type: 'info'
        });
    }

    public loading(): void;
    public loading(message: string): void;
    public loading(message?: string): void {
        this.createLoading({
            content: message
        });
    }

    public confirm(content: string): Promise<any>;
    public confirm(content: string, onConfirm: () => void): void;
    public confirm(option: DialogConfirmOption): Promise<any>;
    public confirm(option: DialogConfirmOption|string, onConfirm?: () => void): Promise<any>|void {
        const opt = typeof option === 'object' ? option : {
            content: option,
            onConfirm,
        };
        if (!onConfirm) {
            return new Promise((resolve, reject) =>{
                opt.onConfirm = () => {
                    resolve(1);
                };
                opt.onCancel = () => {
                    reject();
                }
                this.createDialog(opt);
            });
        }
        this.createDialog(opt);
    }

    public close(id?: any) {
        if (!this.container) {
            return;
        }
        this.container.close(id);
    }

    private createMessage(option: DialogTipOption) {
        if (!this.container) {
            this.readyFn = () => {
                this.createMessage(option);
            };
            return;
        }
        option.dialogId = ++ this.guid;
        this.container.addToast(option);
    }

    private createDialog(option: DialogConfirmOption) {
        if (!this.container) {
            this.readyFn = () => {
                this.createDialog(option);
            };
            return;
        }
        option.dialogId = ++ this.guid;
        this.container.addConfirm(option);
    }

    private createLoading(option: DialogOption) {
        if (!this.container) {
            this.readyFn = () => {
                this.createLoading(option);
            };
            return;
        }
        option.dialogId = ++ this.guid;
        this.container.addLoading(option);
    }

}

export function useDialog(): IDialogSerive {
    return globalSingleton.inject<DialogSerive>(dialogInjectionKey, () => new DialogSerive());
}

export function createDialog(): Plugin {
    return (app: App) => {
        const service = new DialogSerive();
        nextTick(() => {
            const container = createApp(DialogContainer);
            const component = container.mount(document.createElement('div'));
            service.ready(component);
        });
        globalSingleton.provide<DialogSerive>(dialogInjectionKey, service, app);
    };
}