import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, Input, NgZone, Optional, Output, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { animationFrameScheduler, asapScheduler, fromEvent, merge, Subject } from 'rxjs';
import { auditTime, takeUntil } from 'rxjs/operators';
import { NgDropdownPanelService } from './ng-dropdown-panel.service';
import { isDefined } from './value-utils';
const TOP_CSS_CLASS = 'ng-select-top';
const BOTTOM_CSS_CLASS = 'ng-select-bottom';
const SCROLL_SCHEDULER = typeof requestAnimationFrame !== 'undefined' ? animationFrameScheduler : asapScheduler;
export class NgDropdownPanelComponent {
    constructor(_renderer, _zone, _panelService, _elementRef, _document) {
        this._renderer = _renderer;
        this._zone = _zone;
        this._panelService = _panelService;
        this._document = _document;
        this.items = [];
        this.position = 'auto';
        this.virtualScroll = false;
        this.filterValue = null;
        this.update = new EventEmitter();
        this.scroll = new EventEmitter();
        this.scrollToEnd = new EventEmitter();
        this.outsideClick = new EventEmitter();
        this._destroy$ = new Subject();
        this._scrollToEndFired = false;
        this._updateScrollHeight = false;
        this._lastScrollPosition = 0;
        this._dropdown = _elementRef.nativeElement;
    }
    get currentPosition() {
        return this._currentPosition;
    }
    get itemsLength() {
        return this._itemsLength;
    }
    set itemsLength(value) {
        if (value !== this._itemsLength) {
            this._itemsLength = value;
            this._onItemsLengthChanged();
        }
    }
    get _startOffset() {
        if (this.markedItem) {
            const { itemHeight, panelHeight } = this._panelService.dimensions;
            const offset = this.markedItem.index * itemHeight;
            return panelHeight > offset ? 0 : offset;
        }
        return 0;
    }
    ngOnInit() {
        this._select = this._dropdown.parentElement;
        this._virtualPadding = this.paddingElementRef.nativeElement;
        this._scrollablePanel = this.scrollElementRef.nativeElement;
        this._contentPanel = this.contentElementRef.nativeElement;
        this._handleScroll();
        this._handleOutsideClick();
        this._appendDropdown();
        this._setupMousedownListener();
    }
    ngOnChanges(changes) {
        if (changes.items) {
            const change = changes.items;
            this._onItemsChange(change.currentValue, change.firstChange);
        }
    }
    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
        this._destroy$.unsubscribe();
        if (this.appendTo) {
            this._renderer.removeChild(this._dropdown.parentNode, this._dropdown);
        }
    }
    scrollTo(option, startFromOption = false) {
        if (!option) {
            return;
        }
        const index = this.items.indexOf(option);
        if (index < 0 || index >= this.itemsLength) {
            return;
        }
        let scrollTo;
        if (this.virtualScroll) {
            const itemHeight = this._panelService.dimensions.itemHeight;
            scrollTo = this._panelService.getScrollTo(index * itemHeight, itemHeight, this._lastScrollPosition);
        }
        else {
            const item = this._dropdown.querySelector(`#${option.htmlId}`);
            const lastScroll = startFromOption ? item.offsetTop : this._lastScrollPosition;
            scrollTo = this._panelService.getScrollTo(item.offsetTop, item.clientHeight, lastScroll);
        }
        if (isDefined(scrollTo)) {
            this._scrollablePanel.scrollTop = scrollTo;
        }
    }
    scrollToTag() {
        const panel = this._scrollablePanel;
        panel.scrollTop = panel.scrollHeight - panel.clientHeight;
    }
    adjustPosition() {
        this._updateYPosition();
    }
    _handleDropdownPosition() {
        this._currentPosition = this._calculateCurrentPosition(this._dropdown);
        if (this._currentPosition === 'top') {
            this._renderer.addClass(this._dropdown, TOP_CSS_CLASS);
            this._renderer.removeClass(this._dropdown, BOTTOM_CSS_CLASS);
            this._renderer.addClass(this._select, TOP_CSS_CLASS);
            this._renderer.removeClass(this._select, BOTTOM_CSS_CLASS);
        }
        else {
            this._renderer.addClass(this._dropdown, BOTTOM_CSS_CLASS);
            this._renderer.removeClass(this._dropdown, TOP_CSS_CLASS);
            this._renderer.addClass(this._select, BOTTOM_CSS_CLASS);
            this._renderer.removeClass(this._select, TOP_CSS_CLASS);
        }
        if (this.appendTo) {
            this._updateYPosition();
        }
        this._dropdown.style.opacity = '1';
    }
    _handleScroll() {
        this._zone.runOutsideAngular(() => {
            fromEvent(this.scrollElementRef.nativeElement, 'scroll')
                .pipe(takeUntil(this._destroy$), auditTime(0, SCROLL_SCHEDULER))
                .subscribe((e) => {
                const path = e.path || (e.composedPath && e.composedPath());
                const scrollTop = !path || path.length === 0 ? e.target.scrollTop : path[0].scrollTop;
                this._onContentScrolled(scrollTop);
            });
        });
    }
    _handleOutsideClick() {
        if (!this._document) {
            return;
        }
        this._zone.runOutsideAngular(() => {
            merge(fromEvent(this._document, 'touchstart', { capture: true }), fromEvent(this._document, 'mousedown', { capture: true })).pipe(takeUntil(this._destroy$))
                .subscribe($event => this._checkToClose($event));
        });
    }
    _checkToClose($event) {
        if (this._select.contains($event.target) || this._dropdown.contains($event.target)) {
            return;
        }
        const path = $event.path || ($event.composedPath && $event.composedPath());
        if ($event.target && $event.target.shadowRoot && path && path[0] && this._select.contains(path[0])) {
            return;
        }
        this._zone.run(() => this.outsideClick.emit());
    }
    _onItemsChange(items, firstChange) {
        this.items = items || [];
        this._scrollToEndFired = false;
        this.itemsLength = items.length;
        if (this.virtualScroll) {
            this._updateItemsRange(firstChange);
        }
        else {
            this._setVirtualHeight();
            this._updateItems(firstChange);
        }
    }
    _updateItems(firstChange) {
        this.update.emit(this.items);
        if (firstChange === false) {
            return;
        }
        this._zone.runOutsideAngular(() => {
            Promise.resolve().then(() => {
                const panelHeight = this._scrollablePanel.clientHeight;
                this._panelService.setDimensions(0, panelHeight);
                this._handleDropdownPosition();
                this.scrollTo(this.markedItem, firstChange);
            });
        });
    }
    _updateItemsRange(firstChange) {
        this._zone.runOutsideAngular(() => {
            this._measureDimensions().then(() => {
                if (firstChange) {
                    this._renderItemsRange(this._startOffset);
                    this._handleDropdownPosition();
                }
                else {
                    this._renderItemsRange();
                }
            });
        });
    }
    _onContentScrolled(scrollTop) {
        if (this.virtualScroll) {
            this._renderItemsRange(scrollTop);
        }
        this._lastScrollPosition = scrollTop;
        this._fireScrollToEnd(scrollTop);
    }
    _updateVirtualHeight(height) {
        if (this._updateScrollHeight) {
            this._virtualPadding.style.height = `${height}px`;
            this._updateScrollHeight = false;
        }
    }
    _setVirtualHeight() {
        if (!this._virtualPadding) {
            return;
        }
        this._virtualPadding.style.height = `0px`;
    }
    _onItemsLengthChanged() {
        this._updateScrollHeight = true;
    }
    _renderItemsRange(scrollTop = null) {
        if (scrollTop && this._lastScrollPosition === scrollTop) {
            return;
        }
        scrollTop = scrollTop || this._scrollablePanel.scrollTop;
        const range = this._panelService.calculateItems(scrollTop, this.itemsLength, this.bufferAmount);
        this._updateVirtualHeight(range.scrollHeight);
        this._contentPanel.style.transform = `translateY(${range.topPadding}px)`;
        this._zone.run(() => {
            this.update.emit(this.items.slice(range.start, range.end));
            this.scroll.emit({ start: range.start, end: range.end });
        });
        if (isDefined(scrollTop) && this._lastScrollPosition === 0) {
            this._scrollablePanel.scrollTop = scrollTop;
            this._lastScrollPosition = scrollTop;
        }
    }
    _measureDimensions() {
        if (this._panelService.dimensions.itemHeight > 0 || this.itemsLength === 0) {
            return Promise.resolve(this._panelService.dimensions);
        }
        const [first] = this.items;
        this.update.emit([first]);
        return Promise.resolve().then(() => {
            const option = this._dropdown.querySelector(`#${first.htmlId}`);
            const optionHeight = option.clientHeight;
            this._virtualPadding.style.height = `${optionHeight * this.itemsLength}px`;
            const panelHeight = this._scrollablePanel.clientHeight;
            this._panelService.setDimensions(optionHeight, panelHeight);
            return this._panelService.dimensions;
        });
    }
    _fireScrollToEnd(scrollTop) {
        if (this._scrollToEndFired || scrollTop === 0) {
            return;
        }
        const padding = this.virtualScroll ?
            this._virtualPadding :
            this._contentPanel;
        if (scrollTop + this._dropdown.clientHeight >= padding.clientHeight - 1) {
            this._zone.run(() => this.scrollToEnd.emit());
            this._scrollToEndFired = true;
        }
    }
    _calculateCurrentPosition(dropdownEl) {
        if (this.position !== 'auto') {
            return this.position;
        }
        const selectRect = this._select.getBoundingClientRect();
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const offsetTop = selectRect.top + window.pageYOffset;
        const height = selectRect.height;
        const dropdownHeight = dropdownEl.getBoundingClientRect().height;
        if (offsetTop + height + dropdownHeight > scrollTop + document.documentElement.clientHeight) {
            return 'top';
        }
        else {
            return 'bottom';
        }
    }
    _appendDropdown() {
        if (!this.appendTo) {
            return;
        }
        this._parent = document.querySelector(this.appendTo);
        if (!this._parent) {
            throw new Error(`appendTo selector ${this.appendTo} did not found any parent element`);
        }
        this._updateXPosition();
        this._parent.appendChild(this._dropdown);
    }
    _updateXPosition() {
        const select = this._select.getBoundingClientRect();
        const parent = this._parent.getBoundingClientRect();
        const offsetLeft = select.left - parent.left;
        this._dropdown.style.left = offsetLeft + 'px';
        this._dropdown.style.width = select.width + 'px';
        this._dropdown.style.minWidth = select.width + 'px';
    }
    _updateYPosition() {
        const select = this._select.getBoundingClientRect();
        const parent = this._parent.getBoundingClientRect();
        const delta = select.height;
        if (this._currentPosition === 'top') {
            const offsetBottom = parent.bottom - select.bottom;
            this._dropdown.style.bottom = offsetBottom + delta + 'px';
            this._dropdown.style.top = 'auto';
        }
        else if (this._currentPosition === 'bottom') {
            const offsetTop = select.top - parent.top;
            this._dropdown.style.top = offsetTop + delta + 'px';
            this._dropdown.style.bottom = 'auto';
        }
    }
    _setupMousedownListener() {
        this._zone.runOutsideAngular(() => {
            fromEvent(this._dropdown, 'mousedown')
                .pipe(takeUntil(this._destroy$))
                .subscribe((event) => {
                const target = event.target;
                if (target.tagName === 'INPUT') {
                    return;
                }
                event.preventDefault();
            });
        });
    }
}
NgDropdownPanelComponent.decorators = [
    { type: Component, args: [{
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                selector: 'ng-dropdown-panel',
                template: `
        <div *ngIf="headerTemplate" class="ng-dropdown-header">
            <ng-container [ngTemplateOutlet]="headerTemplate" [ngTemplateOutletContext]="{ searchTerm: filterValue }"></ng-container>
        </div>
        <div #scroll class="ng-dropdown-panel-items scroll-host">
            <div #padding [class.total-padding]="virtualScroll"></div>
            <div #content [class.scrollable-content]="virtualScroll && items.length">
                <ng-content></ng-content>
            </div>
        </div>
        <div *ngIf="footerTemplate" class="ng-dropdown-footer">
            <ng-container [ngTemplateOutlet]="footerTemplate" [ngTemplateOutletContext]="{ searchTerm: filterValue }"></ng-container>
        </div>
    `
            },] }
];
NgDropdownPanelComponent.ctorParameters = () => [
    { type: Renderer2 },
    { type: NgZone },
    { type: NgDropdownPanelService },
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] }
];
NgDropdownPanelComponent.propDecorators = {
    items: [{ type: Input }],
    markedItem: [{ type: Input }],
    position: [{ type: Input }],
    appendTo: [{ type: Input }],
    bufferAmount: [{ type: Input }],
    virtualScroll: [{ type: Input }],
    headerTemplate: [{ type: Input }],
    footerTemplate: [{ type: Input }],
    filterValue: [{ type: Input }],
    update: [{ type: Output }],
    scroll: [{ type: Output }],
    scrollToEnd: [{ type: Output }],
    outsideClick: [{ type: Output }],
    contentElementRef: [{ type: ViewChild, args: ['content', { read: ElementRef, static: true },] }],
    scrollElementRef: [{ type: ViewChild, args: ['scroll', { read: ElementRef, static: true },] }],
    paddingElementRef: [{ type: ViewChild, args: ['padding', { read: ElementRef, static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmctZHJvcGRvd24tcGFuZWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL25nLXNlbGVjdC9saWIvbmctZHJvcGRvd24tcGFuZWwuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMzQyxPQUFPLEVBQ0gsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUlOLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUdULFNBQVMsRUFDVCxpQkFBaUIsRUFDcEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLHVCQUF1QixFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUN6RixPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxzQkFBc0IsRUFBbUIsTUFBTSw2QkFBNkIsQ0FBQztBQUl0RixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTFDLE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQztBQUN0QyxNQUFNLGdCQUFnQixHQUFHLGtCQUFrQixDQUFDO0FBQzVDLE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxxQkFBcUIsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7QUFxQmhILE1BQU0sT0FBTyx3QkFBd0I7SUFnQ2pDLFlBQ1ksU0FBb0IsRUFDcEIsS0FBYSxFQUNiLGFBQXFDLEVBQzdDLFdBQXVCLEVBQ2UsU0FBYztRQUo1QyxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBQ3BCLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDYixrQkFBYSxHQUFi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cUJBQ04sTUFBTTswQkFDTixNQUFNOzJCQUNOLE1BQU07Z0NBRU4sU0FBUyxTQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTsrQkFDdkQsU0FBUyxTQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtnQ0FDdEQsU0FBUyxTQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERPQ1VNRU5UIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gICAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgQ29tcG9uZW50LFxuICAgIEVsZW1lbnRSZWYsXG4gICAgRXZlbnRFbWl0dGVyLFxuICAgIEluamVjdCxcbiAgICBJbnB1dCxcbiAgICBOZ1pvbmUsXG4gICAgT25DaGFuZ2VzLFxuICAgIE9uRGVzdHJveSxcbiAgICBPbkluaXQsXG4gICAgT3B0aW9uYWwsXG4gICAgT3V0cHV0LFxuICAgIFJlbmRlcmVyMixcbiAgICBTaW1wbGVDaGFuZ2VzLFxuICAgIFRlbXBsYXRlUmVmLFxuICAgIFZpZXdDaGlsZCxcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGFuaW1hdGlvbkZyYW1lU2NoZWR1bGVyLCBhc2FwU2NoZWR1bGVyLCBmcm9tRXZlbnQsIG1lcmdlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBhdWRpdFRpbWUsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IE5nRHJvcGRvd25QYW5lbFNlcnZpY2UsIFBhbmVsRGltZW5zaW9ucyB9IGZyb20gJy4vbmctZHJvcGRvd24tcGFuZWwuc2VydmljZSc7XG5cbmltcG9ydCB7IERyb3Bkb3duUG9zaXRpb24gfSBmcm9tICcuL25nLXNlbGVjdC5jb21wb25lbnQnO1xuaW1wb3J0IHsgTmdPcHRpb24gfSBmcm9tICcuL25nLXNlbGVjdC50eXBlcyc7XG5pbXBvcnQgeyBpc0RlZmluZWQgfSBmcm9tICcuL3ZhbHVlLXV0aWxzJztcblxuY29uc3QgVE9QX0NTU19DTEFTUyA9ICduZy1zZWxlY3QtdG9wJztcbmNvbnN0IEJPVFRPTV9DU1NfQ0xBU1MgPSAnbmctc2VsZWN0LWJvdHRvbSc7XG5jb25zdCBTQ1JPTExfU0NIRURVTEVSID0gdHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSAhPT0gJ3VuZGVmaW5lZCcgPyBhbmltYXRpb25GcmFtZVNjaGVkdWxlciA6IGFzYXBTY2hlZHVsZXI7XG5cbkBDb21wb25lbnQoe1xuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG4gICAgc2VsZWN0b3I6ICduZy1kcm9wZG93bi1wYW5lbCcsXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGRpdiAqbmdJZj1cImhlYWRlclRlbXBsYXRlXCIgY2xhc3M9XCJuZy1kcm9wZG93bi1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxuZy1jb250YWluZXIgW25nVGVtcGxhdGVPdXRsZXRdPVwiaGVhZGVyVGVtcGxhdGVcIiBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwieyBzZWFyY2hUZXJtOiBmaWx0ZXJWYWx1ZSB9XCI+PC9uZy1jb250YWluZXI+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2ICNzY3JvbGwgY2xhc3M9XCJuZy1kcm9wZG93bi1wYW5lbC1pdGVtcyBzY3JvbGwtaG9zdFwiPlxuICAgICAgICAgICAgPGRpdiAjcGFkZGluZyBbY2xhc3MudG90YWwtcGFkZGluZ109XCJ2aXJ0dWFsU2Nyb2xsXCI+PC9kaXY+XG4gICAgICAgICAgICA8ZGl2ICNjb250ZW50IFtjbGFzcy5zY3JvbGxhYmxlLWNvbnRlbnRdPVwidmlydHVhbFNjcm9sbCAmJiBpdGVtcy5sZW5ndGhcIj5cbiAgICAgICAgICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgKm5nSWY9XCJmb290ZXJUZW1wbGF0ZVwiIGNsYXNzPVwibmctZHJvcGRvd24tZm9vdGVyXCI+XG4gICAgICAgICAgICA8bmctY29udGFpbmVyIFtuZ1RlbXBsYXRlT3V0bGV0XT1cImZvb3RlclRlbXBsYXRlXCIgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInsgc2VhcmNoVGVybTogZmlsdGVyVmFsdWUgfVwiPjwvbmctY29udGFpbmVyPlxuICAgICAgICA8L2Rpdj5cbiAgICBgXG59KVxuZXhwb3J0IGNsYXNzIE5nRHJvcGRvd25QYW5lbENvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3kge1xuXG4gICAgQElucHV0KCkgaXRlbXM6IE5nT3B0aW9uW10gPSBbXTtcbiAgICBASW5wdXQoKSBtYXJrZWRJdGVtOiBOZ09wdGlvbjtcbiAgICBASW5wdXQoKSBwb3NpdGlvbjogRHJvcGRvd25Qb3NpdGlvbiA9ICdhdXRvJztcbiAgICBASW5wdXQoKSBhcHBlbmRUbzogc3RyaW5nO1xuICAgIEBJbnB1dCgpIGJ1ZmZlckFtb3VudDtcbiAgICBASW5wdXQoKSB2aXJ0dWFsU2Nyb2xsID0gZmFsc2U7XG4gICAgQElucHV0KCkgaGVhZGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gICAgQElucHV0KCkgZm9vdGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gICAgQElucHV0KCkgZmlsdGVyVmFsdWU6IHN0cmluZyA9IG51bGw7XG5cbiAgICBAT3V0cHV0KCkgdXBkYXRlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnlbXT4oKTtcbiAgICBAT3V0cHV0KCkgc2Nyb2xsID0gbmV3IEV2ZW50RW1pdHRlcjx7IHN0YXJ0OiBudW1iZXI7IGVuZDogbnVtYmVyIH0+KCk7XG4gICAgQE91dHB1dCgpIHNjcm9sbFRvRW5kID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xuICAgIEBPdXRwdXQoKSBvdXRzaWRlQ2xpY2sgPSBuZXcgRXZlbnRFbWl0dGVyPHZvaWQ+KCk7XG5cbiAgICBAVmlld0NoaWxkKCdjb250ZW50JywgeyByZWFkOiBFbGVtZW50UmVmLCBzdGF0aWM6IHRydWUgfSkgY29udGVudEVsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG4gICAgQFZpZXdDaGlsZCgnc2Nyb2xsJywgeyByZWFkOiBFbGVtZW50UmVmLCBzdGF0aWM6IHRydWUgfSkgc2Nyb2xsRWxlbWVudFJlZjogRWxlbWVudFJlZjtcbiAgICBAVmlld0NoaWxkKCdwYWRkaW5nJywgeyByZWFkOiBFbGVtZW50UmVmLCBzdGF0aWM6IHRydWUgfSkgcGFkZGluZ0VsZW1lbnRSZWY6IEVsZW1lbnRSZWY7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IF9kZXN0cm95JCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfZHJvcGRvd246IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgX3ZpcnR1YWxQYWRkaW5nOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIF9zY3JvbGxhYmxlUGFuZWw6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgX2NvbnRlbnRQYW5lbDogSFRNTEVsZW1lbnQ7XG4gICAgcHJpdmF0ZSBfc2VsZWN0OiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIF9wYXJlbnQ6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgX3Njcm9sbFRvRW5kRmlyZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF91cGRhdGVTY3JvbGxIZWlnaHQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9sYXN0U2Nyb2xsUG9zaXRpb24gPSAwO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIsXG4gICAgICAgIHByaXZhdGUgX3pvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSBfcGFuZWxTZXJ2aWNlOiBOZ0Ryb3Bkb3duUGFuZWxTZXJ2aWNlLFxuICAgICAgICBfZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jdW1lbnQ6IGFueVxuICAgICkge1xuICAgICAgICB0aGlzLl9kcm9wZG93biA9IF9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY3VycmVudFBvc2l0aW9uOiBEcm9wZG93blBvc2l0aW9uO1xuXG4gICAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpOiBEcm9wZG93blBvc2l0aW9uIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pdGVtc0xlbmd0aDogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBnZXQgaXRlbXNMZW5ndGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pdGVtc0xlbmd0aDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldCBpdGVtc0xlbmd0aCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5faXRlbXNMZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuX2l0ZW1zTGVuZ3RoID0gdmFsdWU7XG4gICAgICAgICAgICB0aGlzLl9vbkl0ZW1zTGVuZ3RoQ2hhbmdlZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgX3N0YXJ0T2Zmc2V0KCkge1xuICAgICAgICBpZiAodGhpcy5tYXJrZWRJdGVtKSB7XG4gICAgICAgICAgICBjb25zdCB7IGl0ZW1IZWlnaHQsIHBhbmVsSGVpZ2h0IH0gPSB0aGlzLl9wYW5lbFNlcnZpY2UuZGltZW5zaW9ucztcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHRoaXMubWFya2VkSXRlbS5pbmRleCAqIGl0ZW1IZWlnaHQ7XG4gICAgICAgICAgICByZXR1cm4gcGFuZWxIZWlnaHQgPiBvZmZzZXQgPyAwIDogb2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLl9zZWxlY3QgPSB0aGlzLl9kcm9wZG93bi5wYXJlbnRFbGVtZW50O1xuICAgICAgICB0aGlzLl92aXJ0dWFsUGFkZGluZyA9IHRoaXMucGFkZGluZ0VsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5fc2Nyb2xsYWJsZVBhbmVsID0gdGhpcy5zY3JvbGxFbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIHRoaXMuX2NvbnRlbnRQYW5lbCA9IHRoaXMuY29udGVudEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5faGFuZGxlU2Nyb2xsKCk7XG4gICAgICAgIHRoaXMuX2hhbmRsZU91dHNpZGVDbGljaygpO1xuICAgICAgICB0aGlzLl9hcHBlbmREcm9wZG93bigpO1xuICAgICAgICB0aGlzLl9zZXR1cE1vdXNlZG93bkxpc3RlbmVyKCk7XG4gICAgfVxuXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgICAgICBpZiAoY2hhbmdlcy5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gY2hhbmdlcy5pdGVtcztcbiAgICAgICAgICAgIHRoaXMuX29uSXRlbXNDaGFuZ2UoY2hhbmdlLmN1cnJlbnRWYWx1ZSwgY2hhbmdlLmZpcnN0Q2hhbmdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLl9kZXN0cm95JC5uZXh0KCk7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3kkLmNvbXBsZXRlKCk7XG4gICAgICAgIHRoaXMuX2Rlc3Ryb3kkLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIGlmICh0aGlzLmFwcGVuZFRvKSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDaGlsZCh0aGlzLl9kcm9wZG93bi5wYXJlbnROb2RlLCB0aGlzLl9kcm9wZG93bik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzY3JvbGxUbyhvcHRpb246IE5nT3B0aW9uLCBzdGFydEZyb21PcHRpb24gPSBmYWxzZSkge1xuICAgICAgICBpZiAoIW9wdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLml0ZW1zLmluZGV4T2Yob3B0aW9uKTtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLml0ZW1zTGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2Nyb2xsVG87XG4gICAgICAgIGlmICh0aGlzLnZpcnR1YWxTY3JvbGwpIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1IZWlnaHQgPSB0aGlzLl9wYW5lbFNlcnZpY2UuZGltZW5zaW9ucy5pdGVtSGVpZ2h0O1xuICAgICAgICAgICAgc2Nyb2xsVG8gPSB0aGlzLl9wYW5lbFNlcnZpY2UuZ2V0U2Nyb2xsVG8oaW5kZXggKiBpdGVtSGVpZ2h0LCBpdGVtSGVpZ2h0LCB0aGlzLl9sYXN0U2Nyb2xsUG9zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaXRlbTogSFRNTEVsZW1lbnQgPSB0aGlzLl9kcm9wZG93bi5xdWVyeVNlbGVjdG9yKGAjJHtvcHRpb24uaHRtbElkfWApO1xuICAgICAgICAgICAgY29uc3QgbGFzdFNjcm9sbCA9IHN0YXJ0RnJvbU9wdGlvbiA/IGl0ZW0ub2Zmc2V0VG9wIDogdGhpcy5fbGFzdFNjcm9sbFBvc2l0aW9uO1xuICAgICAgICAgICAgc2Nyb2xsVG8gPSB0aGlzLl9wYW5lbFNlcnZpY2UuZ2V0U2Nyb2xsVG8oaXRlbS5vZmZzZXRUb3AsIGl0ZW0uY2xpZW50SGVpZ2h0LCBsYXN0U2Nyb2xsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0RlZmluZWQoc2Nyb2xsVG8pKSB7XG4gICAgICAgICAgICB0aGlzLl9zY3JvbGxhYmxlUGFuZWwuc2Nyb2xsVG9wID0gc2Nyb2xsVG87XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzY3JvbGxUb1RhZygpIHtcbiAgICAgICAgY29uc3QgcGFuZWwgPSB0aGlzLl9zY3JvbGxhYmxlUGFuZWw7XG4gICAgICAgIHBhbmVsLnNjcm9sbFRvcCA9IHBhbmVsLnNjcm9sbEhlaWdodCAtIHBhbmVsLmNsaWVudEhlaWdodDtcbiAgICB9XG5cbiAgICBhZGp1c3RQb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlWVBvc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlRHJvcGRvd25Qb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY3VycmVudFBvc2l0aW9uID0gdGhpcy5fY2FsY3VsYXRlQ3VycmVudFBvc2l0aW9uKHRoaXMuX2Ryb3Bkb3duKTtcbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRQb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX2Ryb3Bkb3duLCBUT1BfQ1NTX0NMQVNTKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuX2Ryb3Bkb3duLCBCT1RUT01fQ1NTX0NMQVNTKTtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX3NlbGVjdCwgVE9QX0NTU19DTEFTUyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLl9zZWxlY3QsIEJPVFRPTV9DU1NfQ0xBU1MpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyh0aGlzLl9kcm9wZG93biwgQk9UVE9NX0NTU19DTEFTUyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW1vdmVDbGFzcyh0aGlzLl9kcm9wZG93biwgVE9QX0NTU19DTEFTUyk7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlci5hZGRDbGFzcyh0aGlzLl9zZWxlY3QsIEJPVFRPTV9DU1NfQ0xBU1MpO1xuICAgICAgICAgICAgdGhpcy5fcmVuZGVyZXIucmVtb3ZlQ2xhc3ModGhpcy5fc2VsZWN0LCBUT1BfQ1NTX0NMQVNTKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmFwcGVuZFRvKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVZUG9zaXRpb24oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2Ryb3Bkb3duLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaGFuZGxlU2Nyb2xsKCkge1xuICAgICAgICB0aGlzLl96b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIGZyb21FdmVudCh0aGlzLnNjcm9sbEVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCwgJ3Njcm9sbCcpXG4gICAgICAgICAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3kkKSwgYXVkaXRUaW1lKDAsIFNDUk9MTF9TQ0hFRFVMRVIpKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoKGU6IHsgcGF0aCwgY29tcG9zZWRQYXRoLCB0YXJnZXQgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXRoID0gZS5wYXRoIHx8IChlLmNvbXBvc2VkUGF0aCAmJiBlLmNvbXBvc2VkUGF0aCgpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gIXBhdGggfHwgcGF0aC5sZW5ndGggPT09IDAgPyBlLnRhcmdldC5zY3JvbGxUb3AgOiBwYXRoWzBdLnNjcm9sbFRvcFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkNvbnRlbnRTY3JvbGxlZChzY3JvbGxUb3ApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9oYW5kbGVPdXRzaWRlQ2xpY2soKSB7XG4gICAgICAgIGlmICghdGhpcy5fZG9jdW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgbWVyZ2UoXG4gICAgICAgICAgICAgICAgZnJvbUV2ZW50KHRoaXMuX2RvY3VtZW50LCAndG91Y2hzdGFydCcsIHsgY2FwdHVyZTogdHJ1ZSB9KSxcbiAgICAgICAgICAgICAgICBmcm9tRXZlbnQodGhpcy5fZG9jdW1lbnQsICdtb3VzZWRvd24nLCB7IGNhcHR1cmU6IHRydWUgfSlcbiAgICAgICAgICAgICkucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveSQpKVxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoJGV2ZW50ID0+IHRoaXMuX2NoZWNrVG9DbG9zZSgkZXZlbnQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY2hlY2tUb0Nsb3NlKCRldmVudDogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3QuY29udGFpbnMoJGV2ZW50LnRhcmdldCkgfHwgdGhpcy5fZHJvcGRvd24uY29udGFpbnMoJGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhdGggPSAkZXZlbnQucGF0aCB8fCAoJGV2ZW50LmNvbXBvc2VkUGF0aCAmJiAkZXZlbnQuY29tcG9zZWRQYXRoKCkpO1xuICAgICAgICBpZiAoJGV2ZW50LnRhcmdldCAmJiAkZXZlbnQudGFyZ2V0LnNoYWRvd1Jvb3QgJiYgcGF0aCAmJiBwYXRoWzBdICYmIHRoaXMuX3NlbGVjdC5jb250YWlucyhwYXRoWzBdKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fem9uZS5ydW4oKCkgPT4gdGhpcy5vdXRzaWRlQ2xpY2suZW1pdCgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vbkl0ZW1zQ2hhbmdlKGl0ZW1zOiBOZ09wdGlvbltdLCBmaXJzdENoYW5nZTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLml0ZW1zID0gaXRlbXMgfHwgW107XG4gICAgICAgIHRoaXMuX3Njcm9sbFRvRW5kRmlyZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pdGVtc0xlbmd0aCA9IGl0ZW1zLmxlbmd0aDtcblxuICAgICAgICBpZiAodGhpcy52aXJ0dWFsU2Nyb2xsKSB7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVJdGVtc1JhbmdlKGZpcnN0Q2hhbmdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFZpcnR1YWxIZWlnaHQoKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUl0ZW1zKGZpcnN0Q2hhbmdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgX3VwZGF0ZUl0ZW1zKGZpcnN0Q2hhbmdlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMudXBkYXRlLmVtaXQodGhpcy5pdGVtcyk7XG4gICAgICAgIGlmIChmaXJzdENoYW5nZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFuZWxIZWlnaHQgPSB0aGlzLl9zY3JvbGxhYmxlUGFuZWwuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhbmVsU2VydmljZS5zZXREaW1lbnNpb25zKDAsIHBhbmVsSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVEcm9wZG93blBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxUbyh0aGlzLm1hcmtlZEl0ZW0sIGZpcnN0Q2hhbmdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF91cGRhdGVJdGVtc1JhbmdlKGZpcnN0Q2hhbmdlOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fbWVhc3VyZURpbWVuc2lvbnMoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcmVuZGVySXRlbXNSYW5nZSh0aGlzLl9zdGFydE9mZnNldCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZURyb3Bkb3duUG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZW5kZXJJdGVtc1JhbmdlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX29uQ29udGVudFNjcm9sbGVkKHNjcm9sbFRvcDogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLnZpcnR1YWxTY3JvbGwpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlckl0ZW1zUmFuZ2Uoc2Nyb2xsVG9wKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sYXN0U2Nyb2xsUG9zaXRpb24gPSBzY3JvbGxUb3A7XG4gICAgICAgIHRoaXMuX2ZpcmVTY3JvbGxUb0VuZChzY3JvbGxUb3ApO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3VwZGF0ZVZpcnR1YWxIZWlnaHQoaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuX3VwZGF0ZVNjcm9sbEhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5fdmlydHVhbFBhZGRpbmcuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVNjcm9sbEhlaWdodCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0VmlydHVhbEhlaWdodCgpIHtcblxuICAgICAgICBpZiAoIXRoaXMuX3ZpcnR1YWxQYWRkaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl92aXJ0dWFsUGFkZGluZy5zdHlsZS5oZWlnaHQgPSBgMHB4YDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9vbkl0ZW1zTGVuZ3RoQ2hhbmdlZCgpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlU2Nyb2xsSGVpZ2h0ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZW5kZXJJdGVtc1JhbmdlKHNjcm9sbFRvcCA9IG51bGwpIHtcbiAgICAgICAgaWYgKHNjcm9sbFRvcCAmJiB0aGlzLl9sYXN0U2Nyb2xsUG9zaXRpb24gPT09IHNjcm9sbFRvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2Nyb2xsVG9wID0gc2Nyb2xsVG9wIHx8IHRoaXMuX3Njcm9sbGFibGVQYW5lbC5zY3JvbGxUb3A7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5fcGFuZWxTZXJ2aWNlLmNhbGN1bGF0ZUl0ZW1zKHNjcm9sbFRvcCwgdGhpcy5pdGVtc0xlbmd0aCwgdGhpcy5idWZmZXJBbW91bnQpO1xuICAgICAgICB0aGlzLl91cGRhdGVWaXJ0dWFsSGVpZ2h0KHJhbmdlLnNjcm9sbEhlaWdodCk7XG4gICAgICAgIHRoaXMuX2NvbnRlbnRQYW5lbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWSgke3JhbmdlLnRvcFBhZGRpbmd9cHgpYDtcblxuICAgICAgICB0aGlzLl96b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZS5lbWl0KHRoaXMuaXRlbXMuc2xpY2UocmFuZ2Uuc3RhcnQsIHJhbmdlLmVuZCkpO1xuICAgICAgICAgICAgdGhpcy5zY3JvbGwuZW1pdCh7IHN0YXJ0OiByYW5nZS5zdGFydCwgZW5kOiByYW5nZS5lbmQgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChpc0RlZmluZWQoc2Nyb2xsVG9wKSAmJiB0aGlzLl9sYXN0U2Nyb2xsUG9zaXRpb24gPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3Njcm9sbGFibGVQYW5lbC5zY3JvbGxUb3AgPSBzY3JvbGxUb3A7XG4gICAgICAgICAgICB0aGlzLl9sYXN0U2Nyb2xsUG9zaXRpb24gPSBzY3JvbGxUb3A7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9tZWFzdXJlRGltZW5zaW9ucygpOiBQcm9taXNlPFBhbmVsRGltZW5zaW9ucz4ge1xuICAgICAgICBpZiAodGhpcy5fcGFuZWxTZXJ2aWNlLmRpbWVuc2lvbnMuaXRlbUhlaWdodCA+IDAgfHwgdGhpcy5pdGVtc0xlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9wYW5lbFNlcnZpY2UuZGltZW5zaW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBbZmlyc3RdID0gdGhpcy5pdGVtcztcbiAgICAgICAgdGhpcy51cGRhdGUuZW1pdChbZmlyc3RdKTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSB0aGlzLl9kcm9wZG93bi5xdWVyeVNlbGVjdG9yKGAjJHtmaXJzdC5odG1sSWR9YCk7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25IZWlnaHQgPSBvcHRpb24uY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5fdmlydHVhbFBhZGRpbmcuc3R5bGUuaGVpZ2h0ID0gYCR7b3B0aW9uSGVpZ2h0ICogdGhpcy5pdGVtc0xlbmd0aH1weGA7XG4gICAgICAgICAgICBjb25zdCBwYW5lbEhlaWdodCA9IHRoaXMuX3Njcm9sbGFibGVQYW5lbC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLl9wYW5lbFNlcnZpY2Uuc2V0RGltZW5zaW9ucyhvcHRpb25IZWlnaHQsIHBhbmVsSGVpZ2h0KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BhbmVsU2VydmljZS5kaW1lbnNpb25zO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9maXJlU2Nyb2xsVG9FbmQoc2Nyb2xsVG9wOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuX3Njcm9sbFRvRW5kRmlyZWQgfHwgc2Nyb2xsVG9wID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYWRkaW5nID0gdGhpcy52aXJ0dWFsU2Nyb2xsID9cbiAgICAgICAgICAgIHRoaXMuX3ZpcnR1YWxQYWRkaW5nIDpcbiAgICAgICAgICAgIHRoaXMuX2NvbnRlbnRQYW5lbDtcblxuICAgICAgICBpZiAoc2Nyb2xsVG9wICsgdGhpcy5fZHJvcGRvd24uY2xpZW50SGVpZ2h0ID49IHBhZGRpbmcuY2xpZW50SGVpZ2h0IC0gMSkge1xuICAgICAgICAgICAgdGhpcy5fem9uZS5ydW4oKCkgPT4gdGhpcy5zY3JvbGxUb0VuZC5lbWl0KCkpO1xuICAgICAgICAgICAgdGhpcy5fc2Nyb2xsVG9FbmRGaXJlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9jYWxjdWxhdGVDdXJyZW50UG9zaXRpb24oZHJvcGRvd25FbDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHRoaXMucG9zaXRpb24gIT09ICdhdXRvJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VsZWN0UmVjdDogQ2xpZW50UmVjdCA9IHRoaXMuX3NlbGVjdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcbiAgICAgICAgY29uc3Qgb2Zmc2V0VG9wID0gc2VsZWN0UmVjdC50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQ7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHNlbGVjdFJlY3QuaGVpZ2h0O1xuICAgICAgICBjb25zdCBkcm9wZG93bkhlaWdodCA9IGRyb3Bkb3duRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICBpZiAob2Zmc2V0VG9wICsgaGVpZ2h0ICsgZHJvcGRvd25IZWlnaHQgPiBzY3JvbGxUb3AgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm4gJ3RvcCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJ2JvdHRvbSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9hcHBlbmREcm9wZG93bigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmFwcGVuZFRvKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYXJlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuYXBwZW5kVG8pO1xuICAgICAgICBpZiAoIXRoaXMuX3BhcmVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBhcHBlbmRUbyBzZWxlY3RvciAke3RoaXMuYXBwZW5kVG99IGRpZCBub3QgZm91bmQgYW55IHBhcmVudCBlbGVtZW50YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fdXBkYXRlWFBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMuX3BhcmVudC5hcHBlbmRDaGlsZCh0aGlzLl9kcm9wZG93bik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfdXBkYXRlWFBvc2l0aW9uKCkge1xuICAgICAgICBjb25zdCBzZWxlY3QgPSB0aGlzLl9zZWxlY3QuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX3BhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0TGVmdCA9IHNlbGVjdC5sZWZ0IC0gcGFyZW50LmxlZnQ7XG5cbiAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUubGVmdCA9IG9mZnNldExlZnQgKyAncHgnO1xuICAgICAgICB0aGlzLl9kcm9wZG93bi5zdHlsZS53aWR0aCA9IHNlbGVjdC53aWR0aCArICdweCc7XG4gICAgICAgIHRoaXMuX2Ryb3Bkb3duLnN0eWxlLm1pbldpZHRoID0gc2VsZWN0LndpZHRoICsgJ3B4JztcbiAgICB9XG5cbiAgICBwcml2YXRlIF91cGRhdGVZUG9zaXRpb24oKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdCA9IHRoaXMuX3NlbGVjdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5fcGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCBkZWx0YSA9IHNlbGVjdC5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKHRoaXMuX2N1cnJlbnRQb3NpdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldEJvdHRvbSA9IHBhcmVudC5ib3R0b20gLSBzZWxlY3QuYm90dG9tO1xuICAgICAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUuYm90dG9tID0gb2Zmc2V0Qm90dG9tICsgZGVsdGEgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUudG9wID0gJ2F1dG8nO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2N1cnJlbnRQb3NpdGlvbiA9PT0gJ2JvdHRvbScpIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldFRvcCA9IHNlbGVjdC50b3AgLSBwYXJlbnQudG9wO1xuICAgICAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUudG9wID0gb2Zmc2V0VG9wICsgZGVsdGEgKyAncHgnO1xuICAgICAgICAgICAgdGhpcy5fZHJvcGRvd24uc3R5bGUuYm90dG9tID0gJ2F1dG8nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfc2V0dXBNb3VzZWRvd25MaXN0ZW5lcigpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICBmcm9tRXZlbnQodGhpcy5fZHJvcGRvd24sICdtb3VzZWRvd24nKVxuICAgICAgICAgICAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95JCkpXG4gICAgICAgICAgICAgICAgLnN1YnNjcmliZSgoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0LnRhZ05hbWUgPT09ICdJTlBVVCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=