import { NgZone } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { BaseEditor } from './base-editor';
import { NgxMonacoEditorConfig } from './config';
import { NgxEditorModel } from './types';
import * as i0 from "@angular/core";
export declare class EditorComponent extends BaseEditor implements ControlValueAccessor {
    private zone;
    private editorConfig;
    private _value;
    propagateChange: (_: any) => void;
    onTouched: () => void;
    set options(options: any);
    get options(): any;
    set model(model: NgxEditorModel);
    constructor(zone: NgZone, editorConfig: NgxMonacoEditorConfig);
    writeValue(value: any): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    protected initMonaco(options: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<EditorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<EditorComponent, "ngx-monaco-editor", never, { "options": "options"; "model": "model"; }, {}, never, never>;
}
