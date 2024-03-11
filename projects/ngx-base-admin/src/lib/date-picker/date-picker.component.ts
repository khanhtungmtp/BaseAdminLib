import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';

import { ButtonDirective } from '../button';
import { DateRangePickerComponent } from '../date-range-picker';
import { CalendarComponent } from '../calendar';
import { DropdownComponent, DropdownMenuDirective, DropdownToggleDirective } from '../dropdown';
import { FormControlDirective, InputGroupComponent, InputGroupTextDirective } from '../form';
import { TimePickerComponent } from '../time-picker';
import { CustomRangeKeyPipe } from '../date-range-picker/date-range-picker/custom-range-key.pipe';

@Component({
  selector: 'c-date-picker',
  templateUrl: '../date-range-picker/date-range-picker/date-range-picker.component.html',
  exportAs: 'cDatePicker',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgForOf,
    NgTemplateOutlet,
    ReactiveFormsModule,
    CalendarComponent,
    TimePickerComponent,
    ButtonDirective,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    InputGroupComponent,
    FormControlDirective,
    InputGroupTextDirective,
    CustomRangeKeyPipe
  ], providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent extends DateRangePickerComponent {

  constructor(
    breakpointObserver: BreakpointObserver
  ) {
    super(breakpointObserver);
  }

  @Input() override placeholder: string = 'Select date';

  // @ts-ignore
  @Output('dateChange') override startDateChange: EventEmitter<Date | null> = new EventEmitter<Date | null>();

  override get range(): boolean {
    return false;
  }

  override get calendars() {
    return 1;
  }

  override get endDate() {
    return null;
  }

  get date() {
    return this.startDate;
  }

  @Input()
  set date(value: Date | null | undefined) {
    this.startDate = value;
  }

  // @ts-ignore
  override writeValue(value: Date | null | undefined): void {
    this.date = value;
    this.startDateValue = this.date ? this.date.toLocaleDateString(this.locale) : '';
  }

  override subscribeDateChange(subscribe: boolean = true): void {
    if (subscribe) {
      this.dateChangeSubscriptions.push(this.startDateChange.subscribe(next => {
        this.date = next;
        this.onChange(next);
      }));
      return;
    }
    this.dateChangeSubscriptions.forEach(subscription => {
      subscription?.unsubscribe();
    });
  }
}
