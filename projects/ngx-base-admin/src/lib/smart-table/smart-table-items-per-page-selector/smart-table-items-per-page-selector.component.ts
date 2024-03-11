import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { FormLabelDirective, FormSelectDirective } from '../../form';

@Component({
  selector: 'c-smart-table-items-per-page-selector',
  templateUrl: './smart-table-items-per-page-selector.component.html',
  imports: [
    FormSelectDirective,
    FormLabelDirective,
    NgForOf,
    FormsModule
  ],
  standalone: true
})
export class SmartTableItemsPerPageSelectorComponent {

  constructor() { }

  @Input()
  set itemsPerPage(value: number) {
    if (this.#itemsPerPage != value) {
      this.#itemsPerPage = value;
      this.itemsPerPageChange.emit(value);
    }
  }

  get itemsPerPage() {
    return this.#itemsPerPage;
  }

  #itemsPerPage = 5;

  @Input() itemsPerPageLabel: string = 'Items per page:';
  @Input() itemsPerPageOptions: number[] = [5, 10, 20, 50];
  @Output() readonly itemsPerPageChange: EventEmitter<number> = new EventEmitter<number>();

  @HostBinding('class')
  get hostClasses(): any {
    return {
      row: true
    };
  }
}
