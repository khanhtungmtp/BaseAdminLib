import { Pipe, PipeTransform } from '@angular/core';
import { WeekdayFormatType } from '../calendar.service';

@Pipe({
  name: 'calendarWeekday',
  standalone: true
})
export class CalendarWeekdayPipe implements PipeTransform {

  transform(date: Date, weekdayFormat: WeekdayFormatType = 'short', locale: string = 'default'): (string | number) {
    return typeof weekdayFormat === 'function'
      ? weekdayFormat(date)
      : typeof weekdayFormat === 'string'
        ? date.toLocaleDateString(locale, { weekday: weekdayFormat })
        : date.toLocaleDateString(locale, { weekday: 'long' }).slice(0, weekdayFormat);
  }
}
