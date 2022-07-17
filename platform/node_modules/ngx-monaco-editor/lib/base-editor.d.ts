import { AfterViewInit, ElementRef, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxMonacoEditorConfig } from './config';
import * as i0 from "@angular/core";
export declare abstract class BaseEditor implements AfterViewInit, OnDestroy {
    protected config: NgxMonacoEditorConfig;
    _editorContainer: ElementRef;
    onInit: EventEmitter<any>;
    protected _editor: any;
    protected _options: any;
    protected _windowResizeSubscription: Subscription;
    constructor(config: NgxMonacoEditorConfig);
    ngAfterViewInit(): void;
    protected abstract initMonaco(options: any): void;
    ngOnDestroy(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseEditor, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BaseEditor, "ng-component", never, {}, { "onInit": "onInit"; }, never, never>;
}
