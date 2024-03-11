import { Pipe, PipeTransform } from '@angular/core';
import { DayFormatType } from '../calendar.service';

@Pipe({
  name: 'calendarDay',
  standalone: true
})
export class CalendarDayPipe implements PipeTransform {

  transform(date: Date, dayFormat: DayFormatType = 'numeric', locale: string = 'default'): (string | number) {
    return typeof dayFormat === 'function' ?
      dayFormat(date) :
      date.toLocaleDateString(locale, { day: dayFormat });
  }
}
