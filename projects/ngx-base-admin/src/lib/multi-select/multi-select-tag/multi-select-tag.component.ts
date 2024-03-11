import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, inject, Input, Output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { MultiSelectService } from '../multi-select.service';
import { IOption } from '../multi-select.type';

@Component({
  selector: 'c-multi-select-tag',
  templateUrl: './multi-select-tag.component.html',
  styleUrls: ['./multi-select-tag.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSelectTagComponent {

  #multiSelectService = inject(MultiSelectService);

  multiselectVisible = toSignal(this.#multiSelectService.multiSelectVisible$);

  @Input() option?: IOption;

  @Input() disabled: boolean = true;
  @Input() label?: string;
  @Input() value?: any;

  @Output() remove = new EventEmitter<IOption>();

  @HostBinding('class')
  get hostClasses() {
    return {
      'form-multi-select-tag': true
    };
  }

  handleRemove($event: MouseEvent): void {
    $event.stopPropagation();
    if (this.value) {
      this.remove.emit(this.value);
    }
  }

}
