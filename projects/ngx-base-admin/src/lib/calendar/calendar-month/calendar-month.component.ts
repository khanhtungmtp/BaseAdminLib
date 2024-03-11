import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { Subscription } from 'rxjs';

import {
  createGroupsInArray,
  getMonthDetails,
  getMonthsNames,
  getYears,
  isDateDisabled,
  isDateInRangeDisabled,
  tryDate
} from '../calendar.utils';

import { CalendarService, DateFilterType, DayFormatType, WeekdayFormatType } from '../calendar.service';
import { CalendarWeekdayPipe } from './calendar-weekday.pipe';
import { CalendarClassYearPipe } from './calendar-class-year.pipe';
import { CalendarClassMonthPipe } from './calendar-class-month.pipe';
import { CalendarDayPipe } from './calendar-day.pipe';
import { CalendarDayDirective } from './calendar-day.directive';
import { CalendarDayTitlePipe } from './calendar-day-title.pipe';
import { CalendarClassDayPipe } from './calendar-class-day.pipe';

@Component({
  selector: 'c-calendar-month',
  templateUrl: './calendar-month.component.html',
  exportAs: 'cCalendarMonth',
  standalone: true,
  imports: [
    CalendarDayDirective,
    CalendarDayPipe,
    CalendarDayTitlePipe,
    CalendarClassDayPipe,
    CalendarClassMonthPipe,
    CalendarClassYearPipe,
    CalendarWeekdayPipe,
    NgClass,
    NgForOf,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault
  ]
})
export class CalendarMonthComponent implements OnInit, OnDestroy {

  constructor(
    private calendarService: CalendarService
  ) {
    this.calendarStateSubscribe();
  }

  @Input() addMonths: number = 0;

  /**
   * Initial selected date.
   * @type  (Date | null)
   */
  @Input()
  set startDate(value: Date | number | string | null | undefined) {
    const date = !!value ? tryDate(value, 'startDate') : null;
    if (this._startDate?.getTime() !== date?.getTime()) {
      this._startDate = date;
      this.calendarService.update({ startDate: this._startDate });
    }
  }

  get startDate() {
    return this._startDate;
  }

  _startDate: Date | null = null;

  /**
   * Initial selected to date (range).
   * @type  (Date | null)
   */
  @Input()
  set endDate(value: Date | number | string | null | undefined) {
    const date = !!value ? tryDate(value, 'endDate') : null;
    if (this._endDate?.getTime() !== date?.getTime()) {
      this._endDate = date;
      this.calendarService.update({ endDate: this._endDate });
    }
  }

  get endDate() {
    return this._endDate;
  }

  _endDate: (Date | null) = null;

  /**
   * Specify the list of dates that cannot be selected.
   * @type  (Date[] | Date[][])
   */
  @Input()
  set disabledDates(value: Date[] | Date[][]) {
    this._disabledDates = value;
  }

  get disabledDates(): Date[] | Date[][] {
    return this._disabledDates;
  }

  private _disabledDates: (Date[] | Date[][]) = [];

  /**
   * Sets the day of start week.
   * - 0 - Sunday,
   * - 1 - Monday,
   * - 2 - Tuesday,
   * - 3 - Wednesday,
   * - 4 - Thursday,
   * - 5 - Friday,
   * - 6 - Saturday,
   */
  @Input()
  set firstDayOfWeek(value: number) {
    this._firstDayOfWeek = coerceNumberProperty(value);
  }

  get firstDayOfWeek(): number {
    return this._firstDayOfWeek;
  }

  private _firstDayOfWeek: number = 1;

  /**
   * Sets the default locale for components. If not set, it is inherited from the browser.
   * @default 'default'
   */
  @Input()
  set locale(value) {
    this._locale = value;
    this.listOfMonths = createGroupsInArray(getMonthsNames(value), 4);
  }

  get locale() {
    return this._locale;
  }

  private _locale: string = 'default';

  /**
   * Allow range selection.
   */
  @Input()
  set range(value: boolean) {
    this._range = coerceBooleanProperty(value);
  }

  get range(): boolean {
    return this._range;
  }

  private _range: boolean = false;

  /**
   * Set length or format of day name.
   * @type number | 'long' | 'narrow' | 'short'
   * @default 'short'
   */
  @Input() weekdayFormat: WeekdayFormatType = 'short';

  /**
   * Set calendar view.
   * @type 'days' | 'months' | 'years'
   * @default 'days'
   */
  @Input()
  set view(value) {
    this._view = value;
    this.listOfYears = createGroupsInArray(getYears(this.date.getFullYear()), 4);
  }

  get view() {
    return this._view;
  }

  private _view: 'days' | 'months' | 'years' = 'days';

  /**
   * Max selectable date.
   */
  @Input()
  set maxDate(value: Date | null) {
    this._maxDate = value ? tryDate(value, 'maxDate') : null;
  }

  get maxDate() {
    return this._maxDate;
  }

  private _maxDate: Date | null = null;

  /**
   * Min selectable date.
   */
  @Input()
  set minDate(value: Date | null) {
    this._minDate = value ? tryDate(value, 'minDate') : null;
  }

  get minDate() {
    return this._minDate;
  }

  private _minDate: Date | null = null;

  listOfMonths = createGroupsInArray(getMonthsNames(this.locale), 4);
  listOfYears = createGroupsInArray(getYears(this.date.getFullYear()), 4);
  private calendarStateSubscription!: Subscription;

  /**
   * Default date of the component
   * @type Date
   */
  @Input()
  set calendarDate(value: (Date | string | number)) {
    const _value = new Date(tryDate((value ?? this.startDate), 'calendarDate'));
    if (!!_value && this._calendarDate.getTime() !== _value.getTime()) {
      this.listOfYears = createGroupsInArray(getYears(_value.getFullYear()), 4);
      this._calendarDate = new Date(new Date(_value.setDate(1)).setHours(0, 0, 0, 0));
      this.setMonthDetails(this.date);
      this.calendarService.update({ calendarDate: this._calendarDate });
    }
  }

  get calendarDate(): Date {
    return this._calendarDate;
  }

  private _calendarDate: Date = new Date();

  dateFilter!: DateFilterType;

  get date() {
    return new Date(this.calendarDate?.getFullYear(), this.calendarDate?.getMonth() + this.addMonths);
  }

  dayFormat!: DayFormatType;
  selectAdjacentDays!: boolean;
  showAdjacentDays!: boolean;

  private _monthDetails!: { date: Date; month: string; }[][];

  get monthDetails(): { date: Date; month: string; }[][] {
    return this._monthDetails;
  }

  get weekDays() {
    return this.monthDetails[0];
  }

  ngOnInit(): void {
    this.listOfMonths = createGroupsInArray(getMonthsNames(this.locale), 4);
    this.setMonthDetails(this.date);
  }

  setMonthDetails(date: Date = this.date) {
    this._monthDetails = getMonthDetails(
      date.getFullYear(),
      date.getMonth(),
      this.firstDayOfWeek
    );
  }

  yearNumber(year: any) {
    return new Date(year, 0).toLocaleDateString(this.locale, { year: 'numeric' });
  }

  isDateDisabled(date: Date) {
    // @ts-ignore
    return isDateDisabled(date, this.minDate, this.maxDate, this.disabledDates) || (this.dateFilter ? !this.dateFilter(date) : false);
  }

  calendarCellTitle(date: Date) {
    return date.toLocaleDateString(this.locale);
  }

  handleCellMouseEnter(hoverDate: Date) {
    const hoverValue = this.isDateDisabled(hoverDate) ? null : hoverDate;
    this.calendarService.update({ hoverDate: hoverValue });
  }

  handleYearCellClick(year: any) {
    const calendarDate = new Date(year, this.calendarDate.getMonth(), 1, 0, 0, 0, 0);
    this.view = 'months';
    this.calendarService.update({ view: this.view, calendarDate: calendarDate });
  }

  handleYearCellKeyUp($event: KeyboardEvent, year: any) {
    if ($event.key === 'Enter') {
      this.handleYearCellClick(year);
      return;
    }
  }

  handleMonthCellKeyUp($event: KeyboardEvent, i: number, idx: number) {
    if ($event.key === 'Enter') {
      this.handleMonthCellClick(i, idx);
      return;
    }
  }

  handleMonthCellClick(i: number, idx: number) {
    this.setCalendarPage(0, 0, i * 3 + idx - this.addMonths);
    this.view = 'days';
    this.calendarService.update({ view: this.view });
  }

  setCalendarPage(years: number, months = 0, setMonth?: number) {
    const year = this.date.getFullYear();
    const month = this.date.getMonth();
    const d = new Date(year, month, 1, 0, 0, 0, 0);

    years && d.setFullYear(d.getFullYear() + years);
    months && d.setMonth(d.getMonth() + months);
    typeof setMonth === 'number' && d.setMonth(setMonth);

    this.calendarService.update({ calendarDate: d });
  }

  handleCellMouseLeave() {
    this.calendarService.update({ hoverDate: null });
  }

  handleDayCellKeyUp($event: KeyboardEvent, date: Date) {
    if ($event.key === 'Enter') {
      this.handleDayCellClick(date);
      return;
    }
    if ($event.key === 'Tab') {
      this.handleCellMouseEnter(date);
      return;
    }
  }

  handleDayCellClick(date: Date) {
    if (this.isDateDisabled(date)) {
      return;
    }

    if (!this.range) {
      this.endDate = null;
      this.startDate = date;
      return;
    }

    if (this.startDate && this.endDate) {
      const calendarDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      this.calendarDate = calendarDate;
      this.endDate = null;
      this.startDate = null;
      return;
    }

    if (!!this.startDate && !this.endDate) {
      if (this.startDate && date < this.startDate) {
        this.endDate = null;
        this.startDate = date;
      } else {
        this.endDate = date;
      }
    } else {
      this.endDate = null;
      this.startDate = date;
    }

    if (this.startDate && this.endDate) {
      // @ts-ignore
      if (isDateInRangeDisabled(this.startDate, this.endDate, this.disabledDates)) {
        this.startDate = null;
        this.endDate = null;
        return;
      }

      // let date = new Date(this.startDate);
      // while (date < this.endDate) {
      //   date.setDate(date.getDate() + 1);
      //   if (this.isDateDisabled(date)) {
      //     this.startDate = null;
      //     this.endDate = null;
      //     break;
      //   }
      // }
    }
  }

  calendarStateSubscribe(subscribe: boolean = true): void {
    if (subscribe) {
      this.calendarStateSubscription =
        this.calendarService.calendarState$.subscribe(state => {
          const keys = Object.keys(state);
          for (const key of keys) {
            // if (key in this) {
            // @ts-ignore
            this[key] = state[key];
            // }
          }
        });
      return;
    }
    this.calendarStateSubscription?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.calendarStateSubscribe(false);
  }
}
