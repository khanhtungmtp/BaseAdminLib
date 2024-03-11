import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  DestroyRef,
  HostBinding,
  inject,
  Input,
  OnChanges,
  QueryList,
  signal,
  SimpleChanges
} from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MultiSelectService } from '../multi-select.service';
import { MultiSelectOptionComponent } from '../multi-select-option/multi-select-option.component';
import { MultiSelectOptgroupLabelComponent } from './multi-select-optgroup-label.component';

@Component({
  selector: 'c-multi-select-optgroup',
  templateUrl: './multi-select-optgroup.component.html',
  styleUrls: ['./multi-select-optgroup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MultiSelectOptgroupLabelComponent]
})
export class MultiSelectOptgroupComponent implements AfterContentInit, OnChanges {

  constructor(private multiSelectService: MultiSelectService) {}

  readonly #destroyRef = inject(DestroyRef);
  readonly visible = signal(true);

  static ngAcceptInputType_disabled: BooleanInput;

  @Input() label?: string;

  @Input()
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  get disabled(): boolean {
    return this._disabled;
  }

  private _disabled: boolean = false;

  @ContentChildren(MultiSelectOptionComponent, { descendants: true }) multiSelectOptions!: QueryList<MultiSelectOptionComponent>;

  @HostBinding('class') get hostClasses() {
    return {
      'form-multi-select-options': true,
      'd-none': !this.visible()
    };
  }

  ngAfterContentInit(): void {
    this.updateMultiSelectOptions();
    this.watchOptGroupContent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled']) {
      this.updateMultiSelectOptions();
    }
  }

  private updateMultiSelectOptions() {
    this.multiSelectOptions?.forEach((option) => {
      option.disabled = this.disabled || option.disabled;
    });
  }

  private watchOptGroupContent() {
    this.multiSelectService.optionsArray$.pipe(
      tap((x) => {
        this.visible.set(this.multiSelectOptions?.some(option => option.visible));
      }),
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe();
  }
}
