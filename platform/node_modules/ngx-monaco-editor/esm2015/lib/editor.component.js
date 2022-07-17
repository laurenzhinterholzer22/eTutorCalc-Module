import { Component, forwardRef, Inject, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { BaseEditor } from './base-editor';
import { NGX_MONACO_EDITOR_CONFIG } from './config';
import * as i0 from "@angular/core";
export class EditorComponent extends BaseEditor {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2VkaXRvci9zcmMvbGliL2VkaXRvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUM3RSxPQUFPLEVBQXdCLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDekUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVqQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSx3QkFBd0IsRUFBeUIsTUFBTSxVQUFVLENBQUM7O0FBeUIzRSxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxVQUFVO0lBNEI3QyxZQUFvQixJQUFZLEVBQTRDLFlBQW1DO1FBQzdHLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQURGLFNBQUksR0FBSixJQUFJLENBQVE7UUFBNEMsaUJBQVksR0FBWixZQUFZLENBQXVCO1FBM0J2RyxXQUFNLEdBQVcsRUFBRSxDQUFDO1FBRTVCLG9CQUFlLEdBQUcsQ0FBQyxDQUFNLEVBQUUsRUFBRSxHQUFFLENBQUMsQ0FBQztRQUNqQyxjQUFTLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO0lBMEJyQixDQUFDO0lBeEJELElBQ0ksT0FBTyxDQUFDLE9BQVk7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2RSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLE9B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eUJBQXlCLEVBQUU7WUFDbEMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQzlDO1FBQ0QsSUFBSSxDQUFDLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNwRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakMsQ0FBQzs7NEdBMUZVLGVBQWUsd0NBNEJnQix3QkFBd0I7Z0dBNUJ2RCxlQUFlLDRGQU5mLENBQUM7WUFDVixPQUFPLEVBQUUsaUJBQWlCO1lBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDO1lBQzlDLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxpREFoQlEsdURBQXVEOzJGQWtCdEQsZUFBZTtrQkFwQjNCLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLG1CQUFtQjtvQkFDN0IsUUFBUSxFQUFFLHVEQUF1RDtvQkFDakUsTUFBTSxFQUFFLENBQUM7Ozs7Ozs7Ozs7R0FVUixDQUFDO29CQUNGLFNBQVMsRUFBRSxDQUFDOzRCQUNWLE9BQU8sRUFBRSxpQkFBaUI7NEJBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDOzRCQUM5QyxLQUFLLEVBQUUsSUFBSTt5QkFDWixDQUFDO2lCQUNIOzswQkE2Qm9DLE1BQU07MkJBQUMsd0JBQXdCOzRDQXJCOUQsT0FBTztzQkFEVixLQUFLO3VCQUFDLFNBQVM7Z0JBY1osS0FBSztzQkFEUixLQUFLO3VCQUFDLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIGZvcndhcmRSZWYsIEluamVjdCwgSW5wdXQsIE5nWm9uZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgZnJvbUV2ZW50IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7IEJhc2VFZGl0b3IgfSBmcm9tICcuL2Jhc2UtZWRpdG9yJztcbmltcG9ydCB7IE5HWF9NT05BQ09fRURJVE9SX0NPTkZJRywgTmd4TW9uYWNvRWRpdG9yQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHsgTmd4RWRpdG9yTW9kZWwgfSBmcm9tICcuL3R5cGVzJztcblxuZGVjbGFyZSB2YXIgbW9uYWNvOiBhbnk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25neC1tb25hY28tZWRpdG9yJyxcbiAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiZWRpdG9yLWNvbnRhaW5lclwiICNlZGl0b3JDb250YWluZXI+PC9kaXY+JyxcbiAgc3R5bGVzOiBbYFxuICAgICAgOmhvc3Qge1xuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgIGhlaWdodDogMjAwcHg7XG4gICAgICB9XG5cbiAgICAgIC5lZGl0b3ItY29udGFpbmVyIHtcbiAgICAgICAgICB3aWR0aDogMTAwJTtcbiAgICAgICAgICBoZWlnaHQ6IDk4JTtcbiAgICAgIH1cbiAgYF0sXG4gIHByb3ZpZGVyczogW3tcbiAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBFZGl0b3JDb21wb25lbnQpLFxuICAgIG11bHRpOiB0cnVlXG4gIH1dXG59KVxuZXhwb3J0IGNsYXNzIEVkaXRvckNvbXBvbmVudCBleHRlbmRzIEJhc2VFZGl0b3IgaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciB7XG4gIHByaXZhdGUgX3ZhbHVlOiBzdHJpbmcgPSAnJztcblxuICBwcm9wYWdhdGVDaGFuZ2UgPSAoXzogYW55KSA9PiB7fTtcbiAgb25Ub3VjaGVkID0gKCkgPT4ge307XG5cbiAgQElucHV0KCdvcHRpb25zJylcbiAgc2V0IG9wdGlvbnMob3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5fb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29uZmlnLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcbiAgICBpZiAodGhpcy5fZWRpdG9yKSB7XG4gICAgICB0aGlzLl9lZGl0b3IuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5pbml0TW9uYWNvKG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBvcHRpb25zKCk6IGFueSB7XG4gICAgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gIH1cblxuICBASW5wdXQoJ21vZGVsJylcbiAgc2V0IG1vZGVsKG1vZGVsOiBOZ3hFZGl0b3JNb2RlbCkge1xuICAgIHRoaXMub3B0aW9ucy5tb2RlbCA9IG1vZGVsO1xuICAgIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmluaXRNb25hY28odGhpcy5vcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IE5nWm9uZSwgQEluamVjdChOR1hfTU9OQUNPX0VESVRPUl9DT05GSUcpIHByaXZhdGUgZWRpdG9yQ29uZmlnOiBOZ3hNb25hY29FZGl0b3JDb25maWcpIHtcbiAgICBzdXBlcihlZGl0b3JDb25maWcpO1xuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZSB8fCAnJztcbiAgICAvLyBGaXggZm9yIHZhbHVlIGNoYW5nZSB3aGlsZSBkaXNwb3NlIGluIHByb2Nlc3MuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fZWRpdG9yICYmICF0aGlzLm9wdGlvbnMubW9kZWwpIHtcbiAgICAgICAgdGhpcy5fZWRpdG9yLnNldFZhbHVlKHRoaXMuX3ZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlID0gZm47XG4gIH1cblxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0TW9uYWNvKG9wdGlvbnM6IGFueSk6IHZvaWQge1xuXG4gICAgY29uc3QgaGFzTW9kZWwgPSAhIW9wdGlvbnMubW9kZWw7XG5cbiAgICBpZiAoaGFzTW9kZWwpIHtcbiAgICAgIGNvbnN0IG1vZGVsID0gbW9uYWNvLmVkaXRvci5nZXRNb2RlbChvcHRpb25zLm1vZGVsLnVyaSB8fCAnJyk7XG4gICAgICBpZiAobW9kZWwpIHtcbiAgICAgICAgb3B0aW9ucy5tb2RlbCA9IG1vZGVsO1xuICAgICAgICBvcHRpb25zLm1vZGVsLnNldFZhbHVlKHRoaXMuX3ZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9wdGlvbnMubW9kZWwgPSBtb25hY28uZWRpdG9yLmNyZWF0ZU1vZGVsKG9wdGlvbnMubW9kZWwudmFsdWUsIG9wdGlvbnMubW9kZWwubGFuZ3VhZ2UsIG9wdGlvbnMubW9kZWwudXJpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9lZGl0b3IgPSBtb25hY28uZWRpdG9yLmNyZWF0ZSh0aGlzLl9lZGl0b3JDb250YWluZXIubmF0aXZlRWxlbWVudCwgb3B0aW9ucyk7XG5cbiAgICBpZiAoIWhhc01vZGVsKSB7XG4gICAgICB0aGlzLl9lZGl0b3Iuc2V0VmFsdWUodGhpcy5fdmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuX2VkaXRvci5vbkRpZENoYW5nZU1vZGVsQ29udGVudCgoZTogYW55KSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX2VkaXRvci5nZXRWYWx1ZSgpO1xuXG4gICAgICAvLyB2YWx1ZSBpcyBub3QgcHJvcGFnYXRlZCB0byBwYXJlbnQgd2hlbiBleGVjdXRpbmcgb3V0c2lkZSB6b25lLlxuICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcGFnYXRlQ2hhbmdlKHZhbHVlKTtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fZWRpdG9yLm9uRGlkQmx1ckVkaXRvcldpZGdldCgoKSA9PiB7XG4gICAgICB0aGlzLm9uVG91Y2hlZCgpO1xuICAgIH0pO1xuXG4gICAgLy8gcmVmcmVzaCBsYXlvdXQgb24gcmVzaXplIGV2ZW50LlxuICAgIGlmICh0aGlzLl93aW5kb3dSZXNpemVTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuX3dpbmRvd1Jlc2l6ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cbiAgICB0aGlzLl93aW5kb3dSZXNpemVTdWJzY3JpcHRpb24gPSBmcm9tRXZlbnQod2luZG93LCAncmVzaXplJykuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2VkaXRvci5sYXlvdXQoKSk7XG4gICAgdGhpcy5vbkluaXQuZW1pdCh0aGlzLl9lZGl0b3IpO1xuICB9XG5cbn1cbiJdfQ==