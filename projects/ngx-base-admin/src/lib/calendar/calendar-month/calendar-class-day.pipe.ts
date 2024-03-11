import { Pipe, PipeTransform } from '@angular/core';
import { isDateDisabled, isLastDayOfMonth, isToday } from '../calendar.utils';

@Pipe({
  name: 'calendarClassDay',
  standalone: true
})
export class CalendarClassDayPipe implements PipeTransform {

  transform(dateObj: { date: Date; month: string; }, datesConfig?: { minDate: any; maxDate: any; disabledDates: any; dateFilter: any; }): any {
    const { date, month } = { ...dateObj };
    const { minDate, maxDate, disabledDates, dateFilter } = { ...datesConfig };
    // @ts-ignore
    const disabled = isDateDisabled(date, minDate, maxDate, disabledDates) || (dateFilter ? !dateFilter(date) : false);

    return {
      'calendar-cell': true,
      today: isToday(date),
      disabled: disabled,
      next: month === 'next',
      previous: month === 'previous',
      last: isLastDayOfMonth(date)
    };
  }
}
