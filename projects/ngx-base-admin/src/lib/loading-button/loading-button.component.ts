import { Component, EventEmitter, HostBinding, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NgIf } from '@angular/common';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

import { ButtonDirective } from '../button';
import { SpinnerComponent } from '../spinner';
import { loadingButtonAnimation } from './loading-button.animations';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[cLoadingButton], a[cLoadingButton]',
  templateUrl: './loading-button.component.html',
  exportAs: 'cLoadingButton',
  imports: [SpinnerComponent, NgIf],
  standalone: true,
  animations: [loadingButtonAnimation]
})
export class LoadingButtonComponent extends ButtonDirective implements OnChanges {

  static ngAcceptInputType_disabledOnLoading: BooleanInput;

  /**
   * Makes button disabled when loading.
   * @type boolean
   */
  @Input()
  set disabledOnLoading(value: boolean) {
    this._disabledOnLoading = coerceBooleanProperty(value);
  };

  get disabledOnLoading() {
    return this._disabledOnLoading;
  }

  _disabledOnLoading = false;

  /**
   * Loading state (set to true to start animation).
   * @type boolean
   */
  @Input()
  set loading(value: boolean) {
    const newValue = coerceBooleanProperty(value);
    if (this._loading !== newValue) {
      this._loading = newValue;
      this.loadingChange.emit(newValue);
    }
  };

  get loading() {
    return this._loading;
  }

  _loading = false;

  /**
   * Sets type of spinner.
   * @type {'border' | 'grow'}
   */
  @Input() spinnerType: 'border' | 'grow' = 'border';

  /**
   * Event emitted on loading change
   * @type boolean
   */
  @Output() loadingChange: EventEmitter<boolean> = new EventEmitter();

  constructor() {
    super();
  }

  @HostBinding('class')
  override get hostClasses() {
    return {
      'btn-loading': true,
      'is-loading': this.loading,
      disabled: this.disabledOnLoading && this.loading,
      btn: true,
      [`btn-${this.color}`]: !!this.color && !this.variant,
      [`btn-${this.variant}`]: !!this.variant && !this.color,
      [`btn-${this.variant}-${this.color}`]: !!this.variant && !!this.color,
      [`btn-${this.size}`]: !!this.size,
      active: this.active
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loading'] && !changes['loading']?.isFirstChange()) {
      this.disabled = this.disabledOnLoading && changes['loading'].currentValue;
    }
  }
}
