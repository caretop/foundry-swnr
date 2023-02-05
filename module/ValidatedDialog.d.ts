export declare type ButtonData = {
    label: string;
    callback: (html: JQuery<HTMLElement>) => void;
};
interface ValidatedDialogData extends Dialog.Options {
    failCallback: (button: ButtonData) => void;
}
export declare class ValidatedDialog extends Dialog<ValidatedDialogData> {
    constructor(dialogData: Dialog.Data, options: Partial<ValidatedDialogData> | undefined);
    validate(): boolean;
    submit(button: ButtonData): void;
}
export {};
