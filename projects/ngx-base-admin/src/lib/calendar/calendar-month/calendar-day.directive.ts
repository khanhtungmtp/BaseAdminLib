import { Directive, HostBinding, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  isDateDisabled,
  isDateInRange,
  isDateInRangeDisabled,
  isDateSelected,
  isEndDate,
  isStartDate
} from '../calendar.utils';
import { CalendarService, DateFilterType } from '../calendar.service';

@Directive({
  selector: '[cCalendarDay]',
  standalone: true
})
export class CalendarDayDirective implements OnDestroy {

  constructor(
    private calendarService: CalendarService
  ) {
    this.calendarStateSubscribe();
  }

  private date: Date | null = null;
  private month?: string;
  private startDate: Date | null = null;
  private endDate: Date | null = null;
  private hoverDate: Date | null = null;
  private maxDate: Date | null = null;
  private minDate: Date | null = null;
  private range: boolean = false;
  private disabledDates!: (Date | Date[])[];
  private calendarStateSubscription!: Subscription;
  private dateFilter!: DateFilterType;
  private selectAdjacentDays!: boolean;

  private _dateObj?: { date: Date; month: string; };

  @Input('cCalendarDay')
  set dateObj(value: { date: Date; month: string }) {
    this._dateObj = value;
    this.date = value.date;
    this.month = value.month;
  }

  get selectEndDate(): boolean {
    return (this.range && !!this.startDate && !this.endDate);
  }

  @HostBinding('class')
  get hostClasses(): any {

    if (!this.date) {
      return;
    }

    const rangeHover = this.month === 'current' && this.selectEndDate && isDateInRange(this.date, this.startDate, this.hoverDate);
    const start = isStartDate(this.date, this.startDate, this.endDate);
    const end = isEndDate(this.date, this.startDate, this.endDate);
    const inRange = this.month === 'current' && (isDateInRange(this.date, this.startDate, this.endDate) || !!start || !!end);
    const selected = isDateSelected(this.date, this.startDate, this.endDate);
    const disabledRange = isDateInRangeDisabled(this.startDate, this.date, this.disabledDates);
    const disabledDate = isDateDisabled(this.date, this.minDate, this.maxDate, this.disabledDates);
    const disabledByFilter = this.dateFilter ? !this.dateFilter(this.date) : false;
    const clickable = this.month !== 'current' && this.selectAdjacentDays;

    return {
      'range-hover': rangeHover && (!disabledRange || !disabledByFilter),
      selected: !!selected,
      range: inRange,
      start: !!start,
      end: !!end,
      disabled: disabledDate || disabledByFilter,
      clickable: clickable
    };
  }

  ngOnDestroy(): void {
    this.calendarStateSubscribe(false);
  }

  calendarStateSubscribe(subscribe: boolean = true): void {
    if (subscribe) {
      this.calendarStateSubscription =
        this.calendarService.calendarState$.subscribe(state => {
          const {
            startDate = this.startDate,
            endDate = this.endDate,
            hoverDate = this.hoverDate,
            range = this.range,
            maxDate = this.maxDate,
            minDate = this.minDate,
            disabledDates = this.disabledDates,
            dateFilter = this.dateFilter,
            selectAdjacentDays = this.selectAdjacentDays
          } = { ...state };
          this.startDate = startDate;
          this.endDate = endDate;
          this.range = range;
          this.hoverDate = hoverDate;
          this.maxDate = maxDate;
          this.minDate = minDate;
          this.disabledDates = disabledDates;
          this.dateFilter = dateFilter;
          this.selectAdjacentDays = selectAdjacentDays;
        });
      return;
    }
    this.calendarStateSubscription?.unsubscribe();
  }
}
