import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'calendarClassView',
  standalone: true
})
export class CalendarClassViewPipe implements PipeTransform {

  transform(view: string): any {
    return {
      calendar: true,
      [`${view}`]: !!view
    };
  }
}
