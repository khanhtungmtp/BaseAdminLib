import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';
import {
  AsyncPipe,
  NgForOf,
  NgIf,
  NgStyle,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet
} from '@angular/common';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { BehaviorSubject } from 'rxjs';

import { IColumn, IColumnFilter, IColumnFilterValue, ISorter, ISorterValue } from '../smart-table.type';

import { Colors } from '../../coreui.types';
import { HtmlAttributesDirective } from '../../shared';
import { TableColorDirective } from '../../table';
import { FormCheckInputDirective } from '../../form';
import { SmartTableColumnFilterComponent } from '../smart-table-column-filter/smart-table-column-filter.component';
import { FilterInputDirective } from '../smart-table-filter/filter-input.directive';
import { SmartTableColumnLabelPipe } from './smart-table-column-label.pipe';

@Component({
  selector: 'c-smart-table-head',
  templateUrl: './smart-table-head.component.html',
  styleUrls: ['./smart-table-head.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FilterInputDirective,
    FormCheckInputDirective,
    HtmlAttributesDirective,
    SmartTableColumnFilterComponent,
    TableColorDirective,
    AsyncPipe,
    NgForOf,
    NgIf,
    NgStyle,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgTemplateOutlet,
    SmartTableColumnLabelPipe
  ]
})
export class SmartTableHeadComponent implements OnInit {

  constructor() { }

  @Input() columnFilter?: boolean | IColumnFilter;
  @Input() columnFilterState: IColumnFilterValue = {};
  @Input() columnSorter?: boolean | ISorter = true;
  @Input() component?: string = 'thead';
  @Input() columns?: (IColumn | string)[];
  @Input() selectable?: boolean;

  @Input()
  set selectAll(value: boolean) {
    this.#selectAll = coerceBooleanProperty(value);
  };

  get selectAll() {
    return this.#selectAll;
  }

  #selectAll = true;

  #selectedAllPreviousValue?: boolean;

  @Input()
  set selectedAll(value: boolean | 'indeterminate') {
    this.indeterminate$.next(value === 'indeterminate');

    this.#selectedAll = value === 'indeterminate' ? false : coerceBooleanProperty(value);
    if (value !== 'indeterminate') {
      this.#selectedAllPreviousValue = this.#selectedAll;
    }
  };

  get selectedAll() {
    return this.#selectedAll;
  }

  #selectedAll: boolean | 'indeterminate' = false;

  @Input() sorterValue?: ISorterValue;

  @Input()
  set columnFilterTemplates(value) {
    this.#columnFilterTemplates = { ...value };
  };

  get columnFilterTemplates() {
    return this.#columnFilterTemplates;
  };

  #columnFilterTemplates?: any = {};

  @Input()
  set columnLabelTemplates(value) {
    this.#columnLabelTemplates = { ...value };
  };

  get columnLabelTemplates() {
    return this.#columnLabelTemplates;
  };

  #columnLabelTemplates?: any = {};

  @Input()
  set summaryRowTemplate(value) {
    this.#summaryRowTemplate = value;
  };

  get summaryRowTemplate() {
    return this.#summaryRowTemplate;
  };

  #summaryRowTemplate: TemplateRef<unknown> | null = null;

  // todo
  // @Input() sortingIcon?: string | TemplateRef<any>;
  // @Input() sortingIconAscending?: string | TemplateRef<any>;
  // @Input() sortingIconDescending?: string | TemplateRef<any>;

  readonly indeterminate$ = new BehaviorSubject(false);

  @Output() readonly columnFilterStateChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() readonly sorterStateChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() readonly selectAllChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @HostBinding('class')
  get hostClasses() {
    return {
      thead: this.component === 'thead',
      tfoot: this.component === 'tfoot'
    };
  }

  ngOnInit(): void {
    this.columns?.forEach((column, index) => {
      const columnKey = this.columnKey(column);
      this.columnFilterState[columnKey] = this.columnFilterState[columnKey] ?? '';
    });
  }

  tableHeaderCellProps(column: IColumn | string) {
    if (typeof column === 'object' && column._props) {
      const { color, ...props } = { ...column._props };
      return props;
    }
    return {};
  }

  tableHeaderCellColor(column: IColumn | string): Colors {
    if (typeof column === 'object' && column._props) {
      const { color } = { ...column._props };
      return <Colors | string>color;
    }
    return '';
  }

  tableHeaderCellStyles(column: IColumn | string) {
    const style = { verticalAlign: 'middle', overflow: 'hidden', cursor: '' };
    if (
      this.columnSorter &&
      (typeof column !== 'object' ||
        (typeof column === 'object' && (typeof column.sorter === 'undefined' || column.sorter)))
    ) {
      style.cursor = 'pointer';
    }

    if (typeof column === 'object' && column._style) {
      return { ...style, ...column._style };
    }
    return style;
  }

  columnKey(column: IColumn | string) {
    return typeof column === 'object' ? column.key : column;
  }

  getColumnSorterState(column: IColumn | string) {
    const columnKey = this.columnKey(column);
    if (this.sorterValue?.column === columnKey) {
      if (this.sorterValue.state) {
        return this.sorterValue.state;
      }
      return 0;
    }
    return 0;
  }

  handleSortClick(column: IColumn | string, i: number) {
    if (this.columnSorterEnabled(column)) {
      const columnKey = this.columnKey(column);
      this.sorterStateChange.emit({ columnKey, index: i });
    }
  }

  columnFilterEnabled(column: IColumn | string) {
    return typeof column !== 'object' ? true : typeof column.filter === 'undefined' ? true : column.filter;
  }

  columnSorterEnabled(column: IColumn | string) {
    if (!this.columnSorter) {
      return false;
    }
    return (typeof column !== 'object') ? true : typeof column.sorter === 'undefined' ? true : column.sorter;
  }

  handleColumnFilterValueChange($event: { value: string, type?: string, column: (IColumn | string) }) {
    const { value, type: eventType, column } = { ...$event };
    const columnKey = this.columnKey(column);
    const columnFilterValue = value;
    const isLazy = typeof this.columnFilter === 'object' && this.columnFilter.lazy === true;
    if (((isLazy && eventType === 'input') || (!isLazy && eventType === 'change')) && columnFilterValue.length !== 0) {
      return;
    }
    this.columnFilterState[this.columnKey(column)] = columnFilterValue;
    this.columnFilterStateChange.emit({ column: columnKey, value: columnFilterValue, type: eventType });
  }

  handleSelectAllChecked($event: Event) {
    $event.preventDefault();
    ($event.target as HTMLInputElement).checked = !this.#selectedAllPreviousValue;
    // ($event.target as HTMLInputElement).checked = !this.selectedAll;
    const selectAll = ($event.target as HTMLInputElement).checked;
    this.selectAllChange.emit(selectAll);
  }

  getColumnFilter(column: IColumn | string) {
    return `columnFilter_${this.columnKey(column) ?? '_undefined'}`;
  }

  getColumnLabel(column: IColumn | string) {
    if (typeof column === 'object' && column._labelTemplateId) {
      return `columnLabel_${column._labelTemplateId ?? '_undefined'}`;
    }
    return `columnLabel_${this.columnKey(column) ?? '_undefined'}`;
  }

  get columnFilterEvent(): 'change' | 'input' {
    return (typeof this.columnFilter === 'object' && this.columnFilter.lazy) ? 'change' : 'input';
  };

}
