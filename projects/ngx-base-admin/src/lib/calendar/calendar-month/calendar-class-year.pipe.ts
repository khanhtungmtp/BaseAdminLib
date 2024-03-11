import { Pipe, PipeTransform } from '@angular/core';
import { isThisYear } from '../calendar.utils';

@Pipe({
  name: 'calendarClassYear',
  standalone: true
})
export class CalendarClassYearPipe implements PipeTransform {

  transform(year: number, args?: any): any {
    return {
      'calendar-cell': true,
      year: true,
      today: isThisYear(year)
    };
  }
}
