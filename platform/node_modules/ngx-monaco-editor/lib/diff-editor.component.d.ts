import { BaseEditor } from './base-editor';
import { NgxMonacoEditorConfig } from './config';
import { DiffEditorModel } from './types';
import * as i0 from "@angular/core";
export declare class DiffEditorComponent extends BaseEditor {
    private editorConfig;
    _originalModel: DiffEditorModel;
    _modifiedModel: DiffEditorModel;
    set options(options: any);
    get options(): any;
    set originalModel(model: DiffEditorModel);
    set modifiedModel(model: DiffEditorModel);
    constructor(editorConfig: NgxMonacoEditorConfig);
    protected initMonaco(options: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<DiffEditorComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DiffEditorComponent, "ngx-monaco-diff-editor", never, { "options": "options"; "originalModel": "originalModel"; "modifiedModel": "modifiedModel"; }, {}, never, never>;
}
