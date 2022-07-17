import { Component, Inject, Input } from '@angular/core';
import { fromEvent } from 'rxjs';
import { BaseEditor } from './base-editor';
import { NGX_MONACO_EDITOR_CONFIG } from './config';
import * as i0 from "@angular/core";
export class DiffEditorComponent extends BaseEditor {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZi1lZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvZWRpdG9yL3NyYy9saWIvZGlmZi1lZGl0b3IuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRWpDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLHdCQUF3QixFQUF5QixNQUFNLFVBQVUsQ0FBQzs7QUFvQjNFLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxVQUFVO0lBb0NqRCxZQUFzRCxZQUFtQztRQUN2RixLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFEZ0MsaUJBQVksR0FBWixZQUFZLENBQXVCO0lBRXpGLENBQUM7SUFqQ0QsSUFDSSxPQUFPLENBQUMsT0FBWTtRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDMUI7SUFDSCxDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUNJLGFBQWEsQ0FBQyxLQUFzQjtRQUN0QyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztRQUM1QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FB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bmplY3QsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBmcm9tRXZlbnQgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgQmFzZUVkaXRvciB9IGZyb20gJy4vYmFzZS1lZGl0b3InO1xuaW1wb3J0IHsgTkdYX01PTkFDT19FRElUT1JfQ09ORklHLCBOZ3hNb25hY29FZGl0b3JDb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgeyBEaWZmRWRpdG9yTW9kZWwgfSBmcm9tICcuL3R5cGVzJztcblxuZGVjbGFyZSB2YXIgbW9uYWNvOiBhbnk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25neC1tb25hY28tZGlmZi1lZGl0b3InLFxuICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJlZGl0b3ItY29udGFpbmVyXCIgI2VkaXRvckNvbnRhaW5lcj48L2Rpdj4nLFxuICBzdHlsZXM6IFtgXG4gICAgOmhvc3Qge1xuICAgICAgZGlzcGxheTogYmxvY2s7XG4gICAgICBoZWlnaHQ6IDIwMHB4O1xuICAgIH1cblxuICAgIC5lZGl0b3ItY29udGFpbmVyIHtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgaGVpZ2h0OiA5OCU7XG4gICAgfVxuICBgXVxufSlcbmV4cG9ydCBjbGFzcyBEaWZmRWRpdG9yQ29tcG9uZW50IGV4dGVuZHMgQmFzZUVkaXRvciB7XG5cbiAgX29yaWdpbmFsTW9kZWw6IERpZmZFZGl0b3JNb2RlbDtcbiAgX21vZGlmaWVkTW9kZWw6IERpZmZFZGl0b3JNb2RlbDtcblxuICBASW5wdXQoJ29wdGlvbnMnKVxuICBzZXQgb3B0aW9ucyhvcHRpb25zOiBhbnkpIHtcbiAgICB0aGlzLl9vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb25maWcuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuICAgIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmluaXRNb25hY28ob3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IG9wdGlvbnMoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucztcbiAgfVxuXG4gIEBJbnB1dCgnb3JpZ2luYWxNb2RlbCcpXG4gIHNldCBvcmlnaW5hbE1vZGVsKG1vZGVsOiBEaWZmRWRpdG9yTW9kZWwpIHtcbiAgICB0aGlzLl9vcmlnaW5hbE1vZGVsID0gbW9kZWw7XG4gICAgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuaW5pdE1vbmFjbyh0aGlzLm9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIEBJbnB1dCgnbW9kaWZpZWRNb2RlbCcpXG4gIHNldCBtb2RpZmllZE1vZGVsKG1vZGVsOiBEaWZmRWRpdG9yTW9kZWwpIHtcbiAgICB0aGlzLl9tb2RpZmllZE1vZGVsID0gbW9kZWw7XG4gICAgaWYgKHRoaXMuX2VkaXRvcikge1xuICAgICAgdGhpcy5fZWRpdG9yLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuaW5pdE1vbmFjbyh0aGlzLm9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTkdYX01PTkFDT19FRElUT1JfQ09ORklHKSBwcml2YXRlIGVkaXRvckNvbmZpZzogTmd4TW9uYWNvRWRpdG9yQ29uZmlnKSB7XG4gICAgc3VwZXIoZWRpdG9yQ29uZmlnKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0TW9uYWNvKG9wdGlvbnM6IGFueSk6IHZvaWQge1xuXG4gICAgaWYgKCF0aGlzLl9vcmlnaW5hbE1vZGVsIHx8ICF0aGlzLl9tb2RpZmllZE1vZGVsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ29yaWdpbmFsTW9kZWwgb3IgbW9kaWZpZWRNb2RlbCBub3QgZm91bmQgZm9yIG5neC1tb25hY28tZGlmZi1lZGl0b3InKTtcbiAgICB9XG5cbiAgICB0aGlzLl9vcmlnaW5hbE1vZGVsLmxhbmd1YWdlID0gdGhpcy5fb3JpZ2luYWxNb2RlbC5sYW5ndWFnZSB8fCBvcHRpb25zLmxhbmd1YWdlO1xuICAgIHRoaXMuX21vZGlmaWVkTW9kZWwubGFuZ3VhZ2UgPSB0aGlzLl9tb2RpZmllZE1vZGVsLmxhbmd1YWdlIHx8IG9wdGlvbnMubGFuZ3VhZ2U7XG5cbiAgICBsZXQgb3JpZ2luYWxNb2RlbCA9IG1vbmFjby5lZGl0b3IuY3JlYXRlTW9kZWwodGhpcy5fb3JpZ2luYWxNb2RlbC5jb2RlLCB0aGlzLl9vcmlnaW5hbE1vZGVsLmxhbmd1YWdlKTtcbiAgICBsZXQgbW9kaWZpZWRNb2RlbCA9IG1vbmFjby5lZGl0b3IuY3JlYXRlTW9kZWwodGhpcy5fbW9kaWZpZWRNb2RlbC5jb2RlLCB0aGlzLl9tb2RpZmllZE1vZGVsLmxhbmd1YWdlKTtcblxuICAgIHRoaXMuX2VkaXRvckNvbnRhaW5lci5uYXRpdmVFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgIGNvbnN0IHRoZW1lID0gb3B0aW9ucy50aGVtZTtcbiAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZURpZmZFZGl0b3IodGhpcy5fZWRpdG9yQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQsIG9wdGlvbnMpO1xuICAgIG9wdGlvbnMudGhlbWUgPSB0aGVtZTtcbiAgICB0aGlzLl9lZGl0b3Iuc2V0TW9kZWwoe1xuICAgICAgb3JpZ2luYWw6IG9yaWdpbmFsTW9kZWwsXG4gICAgICBtb2RpZmllZDogbW9kaWZpZWRNb2RlbFxuICAgIH0pO1xuXG4gICAgLy8gcmVmcmVzaCBsYXlvdXQgb24gcmVzaXplIGV2ZW50LlxuICAgIGlmICh0aGlzLl93aW5kb3dSZXNpemVTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3dpbmRvd1Jlc2l6ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cbiAgICB0aGlzLl93aW5kb3dSZXNpemVTdWJzY3JpcHRpb24gPSBmcm9tRXZlbnQod2luZG93LCAncmVzaXplJykuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2VkaXRvci5sYXlvdXQoKSk7XG4gICAgdGhpcy5vbkluaXQuZW1pdCh0aGlzLl9lZGl0b3IpO1xuICB9XG5cbn1cbiJdfQ==