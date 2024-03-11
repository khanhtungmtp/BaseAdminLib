import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { FilterInputDirective } from '../smart-table-filter/filter-input.directive';
import { IColumn } from '../smart-table.type';
import { FormControlDirective } from '../../form';

@Component({
  selector: 'c-smart-table-column-filter',
  templateUrl: './smart-table-column-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormControlDirective, AsyncPipe]
})
export class SmartTableColumnFilterComponent {

  constructor() {}

  readonly #filterInputDirective = inject(FilterInputDirective);
  readonly value$ = this.#filterInputDirective.value$;

  @Input()
  set column(value: string | IColumn) {
    this.#filterInputDirective.emitObject = { ...this.#filterInputDirective.emitObject, column: value };
  };

  @Input() sizing?: 'sm' | 'lg' = 'sm';

}
