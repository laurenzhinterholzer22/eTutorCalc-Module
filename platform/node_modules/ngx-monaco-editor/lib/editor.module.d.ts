import { ModuleWithProviders } from '@angular/core';
import { NgxMonacoEditorConfig } from './config';
import * as i0 from "@angular/core";
import * as i1 from "./editor.component";
import * as i2 from "./diff-editor.component";
import * as i3 from "@angular/common";
export declare class MonacoEditorModule {
    static forRoot(config?: NgxMonacoEditorConfig): ModuleWithProviders<MonacoEditorModule>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MonacoEditorModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<MonacoEditorModule, [typeof i1.EditorComponent, typeof i2.DiffEditorComponent], [typeof i3.CommonModule], [typeof i1.EditorComponent, typeof i2.DiffEditorComponent]>;
    static ɵinj: i0.ɵɵInjectorDeclaration<MonacoEditorModule>;
}
