import { Component, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
import { NGX_MONACO_EDITOR_CONFIG } from './config';
import * as i0 from "@angular/core";
let loadedMonaco = false;
let loadPromise;
export class BaseEditor {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1lZGl0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9lZGl0b3Ivc3JjL2xpYi9iYXNlLWVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWlCLFNBQVMsRUFBYyxZQUFZLEVBQUUsTUFBTSxFQUFhLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekgsT0FBTyxFQUFFLHdCQUF3QixFQUF5QixNQUFNLFVBQVUsQ0FBQzs7QUFFM0UsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLElBQUksV0FBMEIsQ0FBQztBQUsvQixNQUFNLE9BQWdCLFVBQVU7SUFPOUIsWUFBd0QsTUFBNkI7UUFBN0IsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7UUFMM0UsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7SUFLNkMsQ0FBQztJQUV6RixlQUFlO1FBQ2IsSUFBSSxZQUFZLEVBQUU7WUFDaEIsd0NBQXdDO1lBQ3hDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNwQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQVksRUFBRSxFQUFFO2dCQUMvQyxNQUFNLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxHQUFHLHVCQUF1QixDQUFDO2dCQUM5RSxJQUFJLE9BQU8sQ0FBTyxNQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUM5QyxPQUFPLEVBQUUsQ0FBQztvQkFDVixPQUFPO2lCQUNSO2dCQUNELE1BQU0sY0FBYyxHQUFRLEdBQUcsRUFBRTtvQkFDL0IsY0FBYztvQkFDUixNQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUMxRCxNQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsdUJBQXVCLENBQUMsRUFBRSxHQUFHLEVBQUU7d0JBQ3BELElBQUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksS0FBSyxVQUFVLEVBQUU7NEJBQ2xELElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7eUJBQzVCO3dCQUNELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUMvQixPQUFPLEVBQUUsQ0FBQztvQkFDWixDQUFDLENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUM7Z0JBRUYsK0JBQStCO2dCQUMvQixJQUFJLENBQU8sTUFBTyxDQUFDLE9BQU8sRUFBRTtvQkFDMUIsTUFBTSxZQUFZLEdBQXNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3pFLFlBQVksQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUM7b0JBQ3RDLFlBQVksQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLFlBQVksQ0FBQztvQkFDMUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDdEQsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ3pDO3FCQUFNO29CQUNMLGNBQWMsRUFBRSxDQUFDO2lCQUNsQjtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBSUQsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLHlCQUF5QixFQUFFO1lBQ2xDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUM5QztRQUNELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1NBQzFCO0lBQ0gsQ0FBQzs7dUdBM0RtQixVQUFVLGtCQU9WLHdCQUF3QjsyRkFQeEIsVUFBVSxzTkFGcEIsRUFBRTsyRkFFUSxVQUFVO2tCQUgvQixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxFQUFFO2lCQUNiOzswQkFRYyxNQUFNOzJCQUFDLHdCQUF3Qjs0Q0FOSSxnQkFBZ0I7c0JBQS9ELFNBQVM7dUJBQUMsaUJBQWlCLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQUNwQyxNQUFNO3NCQUFmLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0LCBPbkRlc3Ryb3ksIE91dHB1dCwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IE5HWF9NT05BQ09fRURJVE9SX0NPTkZJRywgTmd4TW9uYWNvRWRpdG9yQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuXG5sZXQgbG9hZGVkTW9uYWNvID0gZmFsc2U7XG5sZXQgbG9hZFByb21pc2U6IFByb21pc2U8dm9pZD47XG5cbkBDb21wb25lbnQoe1xuICB0ZW1wbGF0ZTogJydcbn0pXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZUVkaXRvciBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gIEBWaWV3Q2hpbGQoJ2VkaXRvckNvbnRhaW5lcicsIHsgc3RhdGljOiB0cnVlIH0pIF9lZGl0b3JDb250YWluZXI6IEVsZW1lbnRSZWY7XG4gIEBPdXRwdXQoKSBvbkluaXQgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgcHJvdGVjdGVkIF9lZGl0b3I6IGFueTtcbiAgcHJvdGVjdGVkIF9vcHRpb25zOiBhbnk7XG4gIHByb3RlY3RlZCBfd2luZG93UmVzaXplU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChOR1hfTU9OQUNPX0VESVRPUl9DT05GSUcpIHByb3RlY3RlZCBjb25maWc6IE5neE1vbmFjb0VkaXRvckNvbmZpZykge31cblxuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgaWYgKGxvYWRlZE1vbmFjbykge1xuICAgICAgLy8gV2FpdCB1bnRpbCBtb25hY28gZWRpdG9yIGlzIGF2YWlsYWJsZVxuICAgICAgbG9hZFByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgIHRoaXMuaW5pdE1vbmFjbyh0aGlzLl9vcHRpb25zKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2FkZWRNb25hY28gPSB0cnVlO1xuICAgICAgbG9hZFByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZTogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGJhc2VVcmwgPSAodGhpcy5jb25maWcuYmFzZVVybCB8fCAnLi9hc3NldHMnKSArICcvbW9uYWNvLWVkaXRvci9taW4vdnMnO1xuICAgICAgICBpZiAodHlwZW9mICgoPGFueT53aW5kb3cpLm1vbmFjbykgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvbkdvdEFtZExvYWRlcjogYW55ID0gKCkgPT4ge1xuICAgICAgICAgIC8vIExvYWQgbW9uYWNvXG4gICAgICAgICAgKDxhbnk+d2luZG93KS5yZXF1aXJlLmNvbmZpZyh7IHBhdGhzOiB7ICd2cyc6IGAke2Jhc2VVcmx9YCB9IH0pO1xuICAgICAgICAgICg8YW55PndpbmRvdykucmVxdWlyZShbYHZzL2VkaXRvci9lZGl0b3IubWFpbmBdLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uTW9uYWNvTG9hZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICB0aGlzLmNvbmZpZy5vbk1vbmFjb0xvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaW5pdE1vbmFjbyh0aGlzLl9vcHRpb25zKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBMb2FkIEFNRCBsb2FkZXIgaWYgbmVjZXNzYXJ5XG4gICAgICAgIGlmICghKDxhbnk+d2luZG93KS5yZXF1aXJlKSB7XG4gICAgICAgICAgY29uc3QgbG9hZGVyU2NyaXB0OiBIVE1MU2NyaXB0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgIGxvYWRlclNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICAgICAgbG9hZGVyU2NyaXB0LnNyYyA9IGAke2Jhc2VVcmx9L2xvYWRlci5qc2A7XG4gICAgICAgICAgbG9hZGVyU2NyaXB0LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkdvdEFtZExvYWRlcik7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsb2FkZXJTY3JpcHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9uR290QW1kTG9hZGVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBpbml0TW9uYWNvKG9wdGlvbnM6IGFueSk6IHZvaWQ7XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuX3dpbmRvd1Jlc2l6ZVN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fd2luZG93UmVzaXplU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9lZGl0b3IpIHtcbiAgICAgIHRoaXMuX2VkaXRvci5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9lZGl0b3IgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG59XG4iXX0=