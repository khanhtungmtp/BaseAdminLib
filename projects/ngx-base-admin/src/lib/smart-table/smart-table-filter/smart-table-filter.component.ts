import { ChangeDetectionStrategy, Component, HostBinding, inject, Input } from '@angular/core';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';

import { FormControlDirective, FormLabelDirective } from '../../form';
import { FilterInputDirective } from './filter-input.directive';

@Component({
  selector: 'c-smart-table-filter',
  templateUrl: './smart-table-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormControlDirective, FormLabelDirective, NgClass, NgIf, AsyncPipe]
  // hostDirectives: [
  //   {
  //     directive: FilterInputDirective,
  //     inputs: ['value', 'delay', 'onEvent'],
  //     outputs: ['valueChange']
  //   }
  // ]
})
export class SmartTableFilterComponent {

  constructor() {}

  readonly #filterInputDirective = inject(FilterInputDirective);
  readonly value$ = this.#filterInputDirective.value$;

  @Input() filterLabel: string = 'Filter:';
  @Input() filterPlaceholder: string = 'Filter';
  @Input() sizing?: 'sm' | 'lg';

  @HostBinding('class')
  get hostClasses(): any {
    return {
      row: true,
      'mb-2': true
    };
  }

  get labelClasses() {
    return {
      'col-form-label': true,
      [`col-form-label-${this.sizing}`]: !!this.sizing
    };
  };
}
