import { NgModule } from '@angular/core';

import { CalendarComponent } from './calendar/calendar.component';
import { CalendarClassViewPipe } from './calendar/calendar-class-view.pipe';
import { CalendarClassYearPipe } from './calendar-month/calendar-class-year.pipe';
import { CalendarDayDirective } from './calendar-month/calendar-day.directive';
import { CalendarClassDayPipe } from './calendar-month/calendar-class-day.pipe';
import { CalendarClassMonthPipe } from './calendar-month/calendar-class-month.pipe';
import { CalendarMonthComponent } from './calendar-month/calendar-month.component';
import { CalendarNavigationComponent } from './calendar-navigation/calendar-navigation.component';
import { CalendarDayPipe } from './calendar-month/calendar-day.pipe';
import { CalendarWeekdayPipe } from './calendar-month/calendar-weekday.pipe';
import { CalendarDayTitlePipe } from './calendar-month/calendar-day-title.pipe';

@NgModule({
  imports: [
    CalendarComponent,
    CalendarClassYearPipe,
    CalendarClassDayPipe,
    CalendarClassMonthPipe,
    CalendarDayDirective,
    CalendarClassViewPipe,
    CalendarNavigationComponent,
    CalendarMonthComponent,
    CalendarDayPipe,
    CalendarWeekdayPipe,
    CalendarDayTitlePipe
  ],
  exports: [
    CalendarComponent,
    CalendarMonthComponent,
    CalendarNavigationComponent
  ]
})
export class CalendarModule {}
