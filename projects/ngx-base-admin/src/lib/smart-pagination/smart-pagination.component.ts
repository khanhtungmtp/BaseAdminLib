import { Component, EventEmitter, HostBinding, Input, Output, TemplateRef } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { coerceNumberProperty, NumberInput } from '@angular/cdk/coercion';

import { PageItemDirective, PageLinkDirective } from '../pagination';
import { ISmartPagination } from './smart-pagination.type';

@Component({
  selector: 'c-smart-pagination',
  templateUrl: './smart-pagination.component.html',
  exportAs: 'cSmartPagination',
  standalone: true,
  imports: [PageItemDirective, PageLinkDirective, NgClass, NgIf, NgForOf]
})
export class SmartPaginationComponent implements ISmartPagination {

  static ngAcceptInputType_activePage: NumberInput;
  static ngAcceptInputType_pages: NumberInput;
  static ngAcceptInputType_limit: NumberInput;

  constructor() { }

  /**
   * Current page number. [docs]
   * @default 1
   * @type number
   */
  @Input()
  set activePage(value: number) {
    this._activePage = coerceNumberProperty(value);
  }

  get activePage(): number {
    return this._activePage;
  }

  private _activePage: number = 1;

  /**
   * Event triggered on activePage change.
   * @type EventEmitter<number>
   */
  @Output() activePageChange: EventEmitter<number> = new EventEmitter<number>();

  /**
   * Show/hide arrows
   * @default true
   * @type boolean
   */
  @Input() arrows: boolean = true;

  /**
   * Show double arrows buttons
   * @default true
   * @type boolean
   */
  @Input() doubleArrows: boolean = true;

  /**
   * Show/hide dots. [docs]
   * @default true
   */
  @Input() dots: boolean = true;

  /**
   * Maximum items number. [docs]
   * @default 5
   * @type number
   */
  @Input()
  set limit(value: number) {
    this._limit = coerceNumberProperty(value);
  }

  get limit(): number {
    return this._limit;
  }

  private _limit: number = 5;

  /**
   * Number of pages. [docs]
   * @type number
   */
  @Input()
  set pages(value: number) {
    this._pages = coerceNumberProperty(value);
  }

  get pages(): number {
    return this._pages;
  }

  private _pages: number = 1;

  /**
   * The content of 'firstButton' button. [docs]
   * @default '&laquo'
   * todo TemplateRef
   */
  @Input() firstButton?: string | TemplateRef<any> = '«';
  // firstButton?: string | TemplateRef<any> = '&laquo;'

  /**
   * The content of 'lastButton' button. [docs]
   * @default '&raquo'
   * todo TemplateRef
   */
  @Input() lastButton?: string | TemplateRef<any> = '»';
  // lastButton?: string | TemplateRef<any> = '&raquo;'

  /**
   * The content of 'nextButton' button. [docs]
   * @default '&lsaquo'
   * todo TemplateRef
   */
  @Input() nextButton?: string | TemplateRef<any> = '›';

  /**
   * The content of 'previousButton' button. [docs]
   * @default '&rsaquo'
   * todo TemplateRef
   */
  @Input() previousButton?: string | TemplateRef<any> = '‹';

  /**
   * Set the alignment of pagination components.
   * @values 'start', 'center', 'end'
   */
  @Input() align?: 'start' | 'center' | 'end' | '' = 'start';

  /**
   * Size the component small or large.
   * @values 'sm', 'lg'
   */
  @Input() size?: 'sm' | 'lg';

  /**
   * Default role for pagination. [docs]
   * @type string
   * @default 'navigation'
   */
  @HostBinding('attr.role')
  @Input() role = 'navigation';

  get paginationClass(): any {
    return {
      pagination: true,
      [`pagination-${this.size}`]: !!this.size,
      [`justify-content-${this.align}`]: !!this.align
    };
  }

  get maxPrevItems() {
    return Math.floor((this._limit - 1) / 2);
  }

  get maxNextItems() {
    return Math.ceil((this._limit - 1) / 2);
  }

  get range(): number {
    return this.activePage + this.maxNextItems;
  }

  get lastItem(): number {
    return this.range >= this._pages ? this._pages : this.range - (this.afterDots ? 1 : 0);
  }

  get computedLimit(): number {
    return this._limit - (this.afterDots ? 1 : 0) - (this.beforeDots ? 1 : 0);
  }

  get itemsLimit(): number {
    return this._pages < this.computedLimit ? this._pages : this.computedLimit;
  }

  get showDots(): boolean {
    return this.dots && this._limit > 4 && this._limit < this._pages;
  }

  get beforeDots(): boolean {
    return this.showDots && this.activePage > this.maxPrevItems + 1;
  }

  get afterDots(): boolean {
    return this.showDots && this.activePage < this._pages - this.maxNextItems;
  }

  get items() {
    if (this.activePage - this.maxPrevItems <= 1) {
      return Array.from(
        {
          length: this.itemsLimit
        },
        (_item, i) => i + 1
      );
    } else {
      return Array.from(
        {
          length: this.itemsLimit
        },
        (_item, i) => {
          return this.lastItem - i;
        }
      ).reverse();
    }
  }

  setPage(page: number) {
    if (page !== this.activePage) {
      this.activePage = page;
      this.activePageChange.emit(page);
    }
  }
}
