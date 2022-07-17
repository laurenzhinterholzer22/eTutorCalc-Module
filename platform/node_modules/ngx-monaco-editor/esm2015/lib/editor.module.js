import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NGX_MONACO_EDITOR_CONFIG } from './config';
import { DiffEditorComponent } from './diff-editor.component';
import { EditorComponent } from './editor.component';
import * as i0 from "@angular/core";
export class MonacoEditorModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Byb2plY3RzL2VkaXRvci9zcmMvbGliL2VkaXRvci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBdUIsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTlELE9BQU8sRUFBRSx3QkFBd0IsRUFBeUIsTUFBTSxVQUFVLENBQUM7QUFDM0UsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9CQUFvQixDQUFDOztBQWVyRCxNQUFNLE9BQU8sa0JBQWtCO0lBQ3RCLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBZ0MsRUFBRTtRQUN0RCxPQUFPO1lBQ0wsUUFBUSxFQUFFLGtCQUFrQjtZQUM1QixTQUFTLEVBQUU7Z0JBQ1QsRUFBRSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRTthQUN4RDtTQUNGLENBQUM7SUFDSixDQUFDOzsrR0FSVSxrQkFBa0I7Z0hBQWxCLGtCQUFrQixpQkFSM0IsZUFBZTtRQUNmLG1CQUFtQixhQUpuQixZQUFZLGFBT1osZUFBZTtRQUNmLG1CQUFtQjtnSEFHVixrQkFBa0IsWUFacEI7WUFDUCxZQUFZO1NBQ2I7MkZBVVUsa0JBQWtCO2tCQWI5QixRQUFRO21CQUFDO29CQUNSLE9BQU8sRUFBRTt3QkFDUCxZQUFZO3FCQUNiO29CQUNELFlBQVksRUFBRTt3QkFDWixlQUFlO3dCQUNmLG1CQUFtQjtxQkFDcEI7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLGVBQWU7d0JBQ2YsbUJBQW1CO3FCQUNwQjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBOR1hfTU9OQUNPX0VESVRPUl9DT05GSUcsIE5neE1vbmFjb0VkaXRvckNvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7IERpZmZFZGl0b3JDb21wb25lbnQgfSBmcm9tICcuL2RpZmYtZWRpdG9yLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBFZGl0b3JDb21wb25lbnQgfSBmcm9tICcuL2VkaXRvci5jb21wb25lbnQnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbXG4gICAgQ29tbW9uTW9kdWxlXG4gIF0sXG4gIGRlY2xhcmF0aW9uczogW1xuICAgIEVkaXRvckNvbXBvbmVudCxcbiAgICBEaWZmRWRpdG9yQ29tcG9uZW50XG4gIF0sXG4gIGV4cG9ydHM6IFtcbiAgICBFZGl0b3JDb21wb25lbnQsXG4gICAgRGlmZkVkaXRvckNvbXBvbmVudFxuICBdXG59KVxuZXhwb3J0IGNsYXNzIE1vbmFjb0VkaXRvck1vZHVsZSB7XG4gIHB1YmxpYyBzdGF0aWMgZm9yUm9vdChjb25maWc6IE5neE1vbmFjb0VkaXRvckNvbmZpZyA9IHt9KTogTW9kdWxlV2l0aFByb3ZpZGVyczxNb25hY29FZGl0b3JNb2R1bGU+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmdNb2R1bGU6IE1vbmFjb0VkaXRvck1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICB7IHByb3ZpZGU6IE5HWF9NT05BQ09fRURJVE9SX0NPTkZJRywgdXNlVmFsdWU6IGNvbmZpZyB9XG4gICAgICBdXG4gICAgfTtcbiAgfVxufVxuIl19