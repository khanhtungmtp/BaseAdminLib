import { Injectable, KeyValueDiffer, KeyValueDiffers } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isValidDate } from './calendar.utils';

export type DateFilterType = (date: Date) => boolean;
export type DayFormatType = 'numeric' | '2-digit' | ((date: Date) => string | number);
export type WeekdayFormatType = number | 'long' | 'narrow' | 'short' | ((date: Date) => string | number);

export interface ICalendarState {
  [key: string]: any;

  calendarDate?: Date | null;
  hoverDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  maxDate?: Date | null;
  minDate?: Date | null;
  disabledDates?: (Date | Date[])[];
  range?: boolean;
  view?: string;
  locale?: string;
  dateFilter?: DateFilterType,
  dayFormat?: DayFormatType,
  weekdayFormat?: WeekdayFormatType;
  navYearFirst?: boolean;
  showAdjacentDays?: boolean;
  selectAdjacentDays?: boolean;
}

@Injectable()
export class CalendarService {

  constructor(
    private keyValueDiffers: KeyValueDiffers
  ) {
    this.differ = this.keyValueDiffers.find(this.calendarStateObject).create();
  }

  private readonly differ!: KeyValueDiffer<any, any>;

  public calendarStateObject: ICalendarState = {
    calendarDate: new Date(),
    hoverDate: null,
    startDate: null,
    endDate: null,
    maxDate: null,
    minDate: null,
    disabledDates: [],
    range: false,
    view: 'days',
    locale: 'default',
    dateFilter: undefined,
    weekdayFormat: 'short',
    dayFormat: 'numeric',
    navYearFirst: false,
    showAdjacentDays: true,
    selectAdjacentDays: false
  };

  private calendarState = new BehaviorSubject<ICalendarState>(this.calendarStateObject);
  calendarState$ = this.calendarState.asObservable();

  update(state: ICalendarState): void {
    const keys = Object.keys(state);
    for (const key of keys) {
      const entry = this.calendarStateObject[key];
      if (entry === state[key]) {
        continue;
      }
      if (isValidDate(state[key]) && entry ? entry.getTime() === state[key]?.getTime() : false) {
        continue;
      }
      this.calendarStateObject[key] = state[key];
    }

    if (this.differ) {
      const changes = this.differ.diff(this.calendarStateObject);
      if (changes) {
        const newState: ICalendarState = { ...this.calendarStateObject };
        changes.forEachChangedItem(item => {
          // console.log('changes', item.key, item, );
          newState[item.key] = item.currentValue;
        });
        this.calendarState.next(newState);
      }
    }
  }
}
