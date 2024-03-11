import { EventEmitter, TemplateRef } from '@angular/core';

export interface ISmartPagination {
  /**
   * Current page number. [docs]
   * @default 1
   * @type number
   */
  activePage?: number;
  /**
   * Event triggered on activePage change.
   * @type EventEmitter<number>
   */
  activePageChange: EventEmitter<number>;
  /**
   * Show/hide arrows. [docs]
   * @default true
   * @type boolean
   */
  arrows?: boolean;
  /**
   * Show double arrows buttons. [docs]
   * @default true
   * @type boolean
   */
  doubleArrows?: boolean;
  /**
   * Show/hide dots. [docs]
   * @default true
   * @type boolean
   */
  dots?: boolean;
  /**
   * Maximum items number. [docs]
   * @default 5
   * @type number
   */
  limit?: number;
  /**
   * Number of pages. [docs]
   * @type number
   */
  pages?: number;
  /**
   * The content of 'firstButton' button. [docs]
   * @default '&laquo'
   */
  firstButton?: string | TemplateRef<any>;
  /**
   * The content of 'lastButton' button. [docs]
   * @default '&raquo'
   */
  lastButton?: string | TemplateRef<any>;
  /**
   * The content of 'previousButton' button. [docs]
   * @default '&lsaquo;'
   */
  nextButton?: string | TemplateRef<any>;
  /**
   * The content of 'nextButton' button. [docs]
   * @default '&rsaquo;'
   */
  previousButton?: string | TemplateRef<any>;
  /**
   * Size of pagination, valid values: 'sm', 'lg'. [docs]
   */
  size?: 'sm' | 'lg';
  /**
   * Set the alignment of pagination components.
   * @values 'start', 'center', 'end'
   * @type string
   */
  align?: 'start' | 'center' | 'end' | '';
  /**
   * Default role for pagination. [docs]
   * @type string
   * @default 'navigation'
   */
  role?: string;
}
