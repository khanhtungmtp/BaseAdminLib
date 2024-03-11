import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calendarDayTitle',
  standalone: true
})
export class CalendarDayTitlePipe implements PipeTransform {

  transform(date: Date, locale: string = 'default'): string {
    return date.toLocaleDateString(locale);
  }

}
