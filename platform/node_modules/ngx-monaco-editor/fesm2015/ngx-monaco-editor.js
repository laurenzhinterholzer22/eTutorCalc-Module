import * as i0 from '@angular/core';
import { InjectionToken, EventEmitter, Component, Inject, ViewChild, Output, forwardRef, Input, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { CommonModule } from '@angular/common';

const NGX_MONACO_EDITOR_CONFIG = new InjectionToken('NGX_MONACO_EDITOR_CONFIG');

let loadedMonaco = false;
let loadPromise;
class BaseEditor {
    constructor(config) {
        this.config = config;
        this.onInit = new EventEmitter();
    }
    ngAfterViewInit() {
        if (loadedMonaco) {
            // Wait until monaco editor is available
            loadPromise.then(() => {
                this.initMonaco(this._options);
            });
        }
        else {
            loadedMonaco = true;
            loadPromise = new Promise((resolve) => {
                const baseUrl = (this.config.baseUrl || './assets') + '/monaco-editor/min/vs';
                if (typeof (window.monaco) === 'object') {
                    resolve();
                    return;
                }
                const onGotAmdLoader = () => {
                    // Load monaco
                    window.require.config({ paths: { 'vs': `${baseUrl}` } });
                    window.require([`vs/editor/editor.main`], () => {
                        if (typeof this.config.onMonacoLoad === 'function') {
                            this.config.onMonacoLoad();
                        }
                        this.initMonaco(this._options);
                        resolve();
                    });
                };
                // Load AMD loader if necessary
                if (!window.require) {
                    const loaderScript = document.createElement('script');
                    loaderScript.type = 'text/javascript';
                    loaderScript.src = `${baseUrl}/loader.js`;
                    loaderScript.addEventListener('load', onGotAmdLoader);
                    document.body.appendChild(loaderScript);
                }
                else {
                    onGotAmdLoader();
                }
            });
        }
    }
    ngOnDestroy() {
        if (this._windowResizeSubscription) {
            this._windowResizeSubscription.unsubscribe();
        }
        if (this._editor) {
            this._editor.dispose();
            this._editor = undefined;
        }
    }
}
BaseEditor.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.0.0", ngImport: i0, type: BaseEditor, deps: [{ token: NGX_MONACO_EDITOR_CONFIG }], target: i0.ɵɵFactoryTarget.Component });
BaseEditor.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.0.0", type: BaseEditor, selector: "ng-component", outputs: { onInit: "onInit" }, viewQueries: [{ propertyName: "_editorContainer", first: true, predicate: ["editorContainer"], descendants: true, static: true }], ngImport: i0, template: '', isInline: true });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.0.0", ngImport: i0, type: BaseEditor, decorators: [{
            type: Component,
            args: [{
                    template: ''
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MONACO_EDITOR_CONFIG]
                }] }]; }, propDecorators: { _editorContainer: [{
                type: ViewChild,
                args: ['editorContainer', { static: true }]
            }], onInit: [{
                type: Output
            }] } });

class EditorComponent extends BaseEditor {
    constructor(zone, editorConfig) {
        super(editorConfig);
        this.zone = zone;
        this.editorConfig = editorConfig;
        this._value = '';
        this.propagateChange = (_) => { };
        this.onTouched = () => { };
    }
    set options(options) {
        this._options = Object.assign({}, this.config.defaultOptions, options);
        if (this._editor) {
            this._editor.dispose();
            this.initMonaco(options);
        }
    }
    get options() {
        return this._options;
    }
    set model(model) {
        this.options.model = model;
        if (this._editor) {
            this._editor.dispose();
            this.initMonaco(this.options);
        }
    }
    writeValue(value) {
        this._value = value || '';
        // Fix for value change while dispose in process.
        setTimeout(() => {
            if (this._editor && !this.options.model) {
                this._editor.setValue(this._value);
            }
        });
    }
    registerOnChange(fn) {
        this.propagateChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    initMonaco(options) {
        const hasModel = !!options.model;
        if (hasModel) {
            const model = monaco.editor.getModel(options.model.uri || '');
            if (model) {
                options.model = model;
                options.model.setValue(this._value);
            }
            else {
                options.model = monaco.editor.createModel(options.model.value, options.model.language, options.model.uri);
            }
        }
        this._editor = monaco.editor.create(this._editorContainer.nativeElement, options);
        if (!hasModel) {
            this._editor.setValue(this._value);
        }
        this._editor.onDidChangeModelContent((e) => {
            const value = this._editor.getValue();
            // value is not propagated to parent when executing outside zone.
            this.zone.run(() => {
                this.propagateChange(value);
                this._value = value;
            });
        });
        this._editor.onDidBlurEditorWidget(() => {
            this.onTouched();
        });
        // refresh layout on resize event.
        if (this._windowResizeSubscription) {
            this._windowResizeSubscription.unsubscribe();
        }
        this._windowResizeSubscription = fromEvent(window, 'resize').subscribe(() => this._editor.layout());
        this.onInit.emit(this._editor);
    }
}
EditorComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.0.0", ngImport: i0, type: EditorComponent, deps: [{ token: i0.NgZone }, { token: NGX_MONACO_EDITOR_CONFIG }], target: i0.ɵɵFactoryTarget.Component });
EditorComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.0.0", type: EditorComponent, selector: "ngx-monaco-editor", inputs: { options: "options", model: "model" }, providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EditorComponent),
            multi: true
        }], usesInheritance: true, ngImport: i0, template: '<div class="editor-container" #editorContainer></div>', isInline: true, styles: ["\n      :host {\n          display: block;\n          height: 200px;\n      }\n\n      .editor-container {\n          width: 100%;\n          height: 98%;\n      }\n  "] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.0.0", ngImport: i0, type: EditorComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-monaco-editor',
                    template: '<div class="editor-container" #editorContainer></div>',
                    styles: [`
      :host {
          display: block;
          height: 200px;
      }

      .editor-container {
          width: 100%;
          height: 98%;
      }
  `],
                    providers: [{
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => EditorComponent),
                            multi: true
                        }]
                }]
        }], ctorParameters: function () { return [{ type: i0.NgZone }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MONACO_EDITOR_CONFIG]
                }] }]; }, propDecorators: { options: [{
                type: Input,
                args: ['options']
            }], model: [{
                type: Input,
                args: ['model']
            }] } });

class DiffEditorComponent extends BaseEditor {
    constructor(editorConfig) {
        super(editorConfig);
        this.editorConfig = editorConfig;
    }
    set options(options) {
        this._options = Object.assign({}, this.config.defaultOptions, options);
        if (this._editor) {
            this._editor.dispose();
            this.initMonaco(options);
        }
    }
    get options() {
        return this._options;
    }
    set originalModel(model) {
        this._originalModel = model;
        if (this._editor) {
            this._editor.dispose();
            this.initMonaco(this.options);
        }
    }
    set modifiedModel(model) {
        this._modifiedModel = model;
        if (this._editor) {
            this._editor.dispose();
            this.initMonaco(this.options);
        }
    }
    initMonaco(options) {
        if (!this._originalModel || !this._modifiedModel) {
            throw new Error('originalModel or modifiedModel not found for ngx-monaco-diff-editor');
        }
        this._originalModel.language = this._originalModel.language || options.language;
        this._modifiedModel.language = this._modifiedModel.language || options.language;
        let originalModel = monaco.editor.createModel(this._originalModel.code, this._originalModel.language);
        let modifiedModel = monaco.editor.createModel(this._modifiedModel.code, this._modifiedModel.language);
        this._editorContainer.nativeElement.innerHTML = '';
        const theme = options.theme;
        this._editor = monaco.editor.createDiffEditor(this._editorContainer.nativeElement, options);
        options.theme = theme;
        this._editor.setModel({
            original: originalModel,
            modified: modifiedModel
        });
        // refresh layout on resize event.
        if (this._windowResizeSubscription) {
            this._windowResizeSubscription.unsubscribe();
        }
        this._windowResizeSubscription = fromEvent(window, 'resize').subscribe(() => this._editor.layout());
        this.onInit.emit(this._editor);
    }
}
DiffEditorComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.0.0", ngImport: i0, type: DiffEditorComponent, deps: [{ token: NGX_MONACO_EDITOR_CONFIG }], target: i0.ɵɵFactoryTarget.Component });
DiffEditorComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.0.0", type: DiffEditorComponent, selector: "ngx-monaco-diff-editor", inputs: { options: "options", originalModel: "originalModel", modifiedModel: "modifiedModel" }, usesInheritance: true, ngImport: i0, template: '<div class="editor-container" #editorContainer></div>', isInline: true, styles: ["\n    :host {\n      display: block;\n      height: 200px;\n    }\n\n    .editor-container {\n      width: 100%;\n      height: 98%;\n    }\n  "] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.0.0", ngImport: i0, type: DiffEditorComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-monaco-diff-editor',
                    template: '<div class="editor-container" #editorContainer></div>',
                    styles: [`
    :host {
      display: block;
      height: 200px;
    }

    .editor-container {
      width: 100%;
      height: 98%;
    }
  `]
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NGX_MONACO_EDITOR_CONFIG]
                }] }]; }, propDecorators: { options: [{
                type: Input,
                args: ['options']
            }], originalModel: [{
                type: Input,
                args: ['originalModel']
            }], modifiedModel: [{
                type: Input,
                args: ['modifiedModel']
            }] } });

class MonacoEditorModule {
    static forRoot(config = {}) {
        return {
            ngModule: MonacoEditorModule,
            providers: [
                { provide: NGX_MONACO_EDITOR_CONFIG, useValue: config }
            ]
        };
    }
}
MonacoEditorModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.0.0", ngImport: i0, type: MonacoEditorModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
MonacoEditorModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.0.0", ngImport: i0, type: MonacoEditorModule, declarations: [EditorComponent,
        DiffEditorComponent], imports: [CommonModule], exports: [EditorComponent,
        DiffEditorComponent] });
MonacoEditorModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.0.0", ngImport: i0, type: MonacoEditorModule, imports: [[
            CommonModule
        ]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.0.0", ngImport: i0, type: MonacoEditorModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule
                    ],
                    declarations: [
                        EditorComponent,
                        DiffEditorComponent
                    ],
                    exports: [
                        EditorComponent,
                        DiffEditorComponent
                    ]
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { DiffEditorComponent, EditorComponent, MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG };
//# sourceMappingURL=ngx-monaco-editor.js.map
