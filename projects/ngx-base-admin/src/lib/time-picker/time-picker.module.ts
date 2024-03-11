import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormModule } from '../form';

import { ButtonModule } from '../button';
import { DropdownModule } from '../dropdown';
import { TimeElementDirective, TimePickerRollColComponent } from './time-picker-roll-col/time-picker-roll-col.component';
import { DayPeriodElementDirective, TimePickerRollAmPmComponent } from './time-picker-roll-col/time-picker-roll-am-pm.component';
import { TimePickerComponent } from './time-picker.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormModule,
    ButtonModule,
    DropdownModule,
    DayPeriodElementDirective,
    TimeElementDirective,
    TimePickerComponent,
    TimePickerRollAmPmComponent,
    TimePickerRollColComponent
  ],
  exports: [TimePickerComponent]
})
export class TimePickerModule {}
