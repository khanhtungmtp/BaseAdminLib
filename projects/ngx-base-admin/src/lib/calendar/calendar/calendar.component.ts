import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { NgClass, NgForOf } from '@angular/common';
import { BooleanInput, coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { Subscription } from 'rxjs';

import { CalendarService, DateFilterType, DayFormatType, WeekdayFormatType } from '../calendar.service';
import { tryDate } from '../calendar.utils';
import { CalendarMonthComponent } from '../calendar-month/calendar-month.component';
import { CalendarNavigationComponent } from '../calendar-navigation/calendar-navigation.component';
import { CalendarClassViewPipe } from './calendar-class-view.pipe';

@Component({
  selector: 'c-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  exportAs: 'cCalendar',
  providers: [CalendarService],
  standalone: true,
  imports: [CalendarNavigationComponent, CalendarClassViewPipe, CalendarMonthComponent, NgForOf, NgClass]
})
export class CalendarComponent implements OnInit, OnDestroy {

  static ngAcceptInputType_navigation: BooleanInput;
  static ngAcceptInputType_navYearFirst: BooleanInput;
  static ngAcceptInputType_range: BooleanInput;
  static ngAcceptInputType_selectAdjacentDays: BooleanInput;

  constructor(
    private calendarService: CalendarService
  ) {
    this.calendarStateSubscribe();
  }

  /**
   * Default date of the component
   * @type  (Date | string)
   */
  @Input()
  set calendarDate(value: Date | string | number) {
    // const _value = new Date(tryDate((value ?? this.startDate ?? new Date()), 'calendarDate'));
    const _value = new Date(tryDate(value ?? this.startDate, 'calendarDate'));
    if (!!_value && this._calendarDate.getTime() !== _value.getTime()) {
      const _calendarDate = new Date(new Date(_value.setDate(1)).setHours(0, 0, 0, 0));
      this._calendarDate = _calendarDate;
      this.calendarDateChange.emit(_calendarDate);
      this.calendarService.update({ calendarDate: _calendarDate });
    }
  }

  get calendarDate(): Date {
    return this._calendarDate;
  }

  private _calendarDate: Date = tryDate(new Date());

  /**
   * The number of calendars that render on desktop devices.
   * @type number
   * default 1
   */
  @Input()
  set calendars(value: number) {
    this._calendars = coerceNumberProperty(value);
  }

  get calendars(): number {
    return this._calendars;
  }

  private _calendars: number = 1;

  get calendarsArray() {
    return Array.from({ length: this.calendars });
  }

  /**
   * Set the format of day name.
   * @default 'numeric'
   * @type DayFormatType
   */
  @Input()
  set dayFormat(value: DayFormatType) {
    this._dayFormat = value;
    this.calendarService.update({ dayFormat: this._dayFormat });
  }

  get dayFormat() {
    return this._dayFormat;
  }

  private _dayFormat: DayFormatType = 'numeric';

  /**
   * Specify the list of dates that cannot be selected.
   * @type  (Date[] | Date[][])
   */
  @Input()
  set disabledDates(value: Date[] | Date[][]) {
    this._disabledDates = value;
    this.calendarService.update({ disabledDates: this._disabledDates });
  }

  get disabledDates(): Date[] | Date[][] {
    return this._disabledDates;
  }

  private _disabledDates: (Date[] | Date[][]) = [];

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
      if (!this.range || !this._startDate || (this.endDate && this._startDate > this.endDate)) {
        this.endDate = null;
      }
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
      // this._endDate = this.range ? this._endDate : null;
      this.calendarService.update({ endDate: this._endDate });
    }
  }

  get endDate() {
    return this.range ? this._endDate : null;
  }

  _endDate: (Date | null) = null;

  /**
   * Sets the day of start week.
   * - 0 - Sunday,
   * - 1 - Monday,
   * - 2 - Tuesday,
   * - 3 - Wednesday,
   * - 4 - Thursday,
   * - 5 - Friday,
   * - 6 - Saturday,
   *
   * @type number
   * @default 1
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
  set locale(value: string) {
    this._locale = value;
    this.calendarService.update({ locale: value });
  }

  get locale() {
    return this._locale;
  }

  private _locale: string = 'default';

  /**
   * Max selectable date.
   */
  @Input()
  set maxDate(value: Date | string | null | undefined) {
    this._maxDate = !!value ? tryDate(value, 'maxDate') : null;
    this.calendarService.update({ maxDate: this._maxDate });
  }

  get maxDate() {
    return this._maxDate;
  }

  private _maxDate: Date | null = null;

  /**
   * Min selectable date.
   */
  @Input()
  set minDate(value: Date | string | null | undefined) {
    this._minDate = value ? tryDate(value, 'minDate') : null;
    this.calendarService.update({ minDate: this._minDate });
  }

  get minDate() {
    return this._minDate;
  }

  private _minDate: Date | null = null;

  /**
   * Show navigation.
   * @type boolean
   */
  @Input()
  set navigation(value: boolean) {
    this._navigation = coerceBooleanProperty(value);
  }

  get navigation(): boolean {
    return this._navigation;
  }

  private _navigation: boolean = true;

  /**
   * Reorder year-month navigation, and render year first.
   * @type boolean
   * @default false
   */
  @Input()
  set navYearFirst(value: boolean) {
    this._navYearFirst = coerceBooleanProperty(value);
    this.calendarService.update({ navYearFirst: this._navYearFirst });
  }

  get navYearFirst() {
    return this._navYearFirst;
  }

  private _navYearFirst: boolean = false;

  /**
   * Allow range selection.
   * @type boolean
   * @default false
   */
  @Input()
  set range(value: boolean) {
    this._range = coerceBooleanProperty(value);
    this.calendarService.update({ range: this._range });
  }

  get range(): boolean {
    return this._range;
  }

  private _range: boolean = false;

  /**
   * Set calendar view.
   * @type 'days' | 'months' | 'years'
   * @default 'days'
   */
  @Input()
  set view(value) {
    this._view = value;
    this.calendarService.update({ view: value });
  }

  get view() {
    return this._view;
  }

  private _view: 'days' | 'months' | 'years' = 'days';

  /**
   * Set length or format of day name.
   * @type number | 'long' | 'narrow' | 'short'
   * @default 'short'
   */
  @Input()
  set weekdayFormat(value: WeekdayFormatType) {
    this._weekdayFormat = value;
    this.calendarService.update({ weekdayFormat: this._weekdayFormat });
  }

  get weekdayFormat() {
    return this._weekdayFormat;
  }

  private _weekdayFormat: WeekdayFormatType = 'short';

  @Input()
  set dateFilter(value: DateFilterType | undefined) {
    this.calendarService.update({ dateFilter: value });
  }

  /**
   * Set whether days in adjacent months shown before or after the current month are selectable. This only applies if the `showAdjacentDays` option is set to true.
   * @type boolean
   * @default false
   * @since 4.4.10
   */
  @Input() selectAdjacentDays: boolean = false;

  /**
   * Set whether to display dates in adjacent months (non-selectable) at the start and end of the current month.
   * @type boolean
   * @default true
   * @since 4.4.10
   */
  @Input() showAdjacentDays: boolean = true;

  @Output() calendarCellHover: EventEmitter<Date | null> = new EventEmitter<Date | null>();
  @Output() calendarDateChange: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() endDateChange: EventEmitter<Date | null> = new EventEmitter<Date | null>();
  @Output() startDateChange: EventEmitter<Date | null> = new EventEmitter<Date | null>();
  @Output() viewChange: EventEmitter<string> = new EventEmitter<string>();

  // used with calendarService
  set hoverDate(value: Date | null) {
    this._hoverDate = value;
    this.calendarCellHover.emit(value);
  }

  get hoverDate(): Date | null {
    return this._hoverDate;
  }

  private _hoverDate: Date | null = null;

  private calendarStateSubscription!: Subscription;

  @HostBinding('class')
  get hostClasses(): any {
    return {
      'calendars': true
    };
  }

  @ViewChildren(CalendarMonthComponent) calendarMonths!: QueryList<CalendarMonthComponent>;

  ngOnDestroy(): void {
    this.calendarStateSubscribe(false);
  }

  ngOnInit(): void {
    this.calendarService.update({
      locale: this.locale,
      view: this.view,
      range: this.range,
      showAdjacentDays: this.showAdjacentDays,
      selectAdjacentDays: this.selectAdjacentDays
    });
  }

  calendarStateSubscribe(subscribe: boolean = true): void {
    if (subscribe) {
      this.calendarStateSubscription =
        this.calendarService.calendarState$.subscribe(state => {
          const keys = Object.keys(state);
          for (const key of keys) {
            if (key in this) {
              // @ts-ignore
              if (this[key] !== state[key]) {
                // @ts-ignore
                this[key] = state[key];
                if (key === 'startDate') {
                  setTimeout(() => {
                    this.startDateChange.emit(this._startDate);
                  });
                  continue;
                }
                if (key === 'endDate') {
                  setTimeout(() => {
                    this.endDateChange.emit(this._endDate);
                  });
                }
              }
            }
          }
        });
      return;
    }
    this.calendarStateSubscription?.unsubscribe();
  }

  setCalendarPage(years: number, months = 0, setMonth?: number) {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();
    const d = new Date(year, month, 1);

    years && d.setFullYear(d.getFullYear() + years);
    months && d.setMonth(d.getMonth() + months);
    typeof setMonth === 'number' && d.setMonth(setMonth);

    this.calendarDate = d;
  }

  handleNavigationClick(direction: 'prev' | 'next', years = false) {
    if (direction === 'prev') {
      if (years) {
        this.setCalendarPage(this.view === 'years' ? -10 : -1);
        return;
      }

      if (this.view !== 'days') {
        this.setCalendarPage(-1);
        return;
      }

      this.setCalendarPage(0, -1);
      return;
    }
    if (direction === 'next') {
      if (years) {
        this.setCalendarPage(this.view === 'years' ? 10 : 1);
        return;
      }

      if (this.view !== 'days') {
        this.setCalendarPage(1);
        return;
      }

      this.setCalendarPage(0, 1);
      return;
    }
  }

  /**
   * Clear startDate and endDate
   * @type void
   */
  public clearDates() {
    this.calendarService.update({ endDate: null });
    this.calendarService.update({ startDate: null });
  }
}
