import { Component, EventEmitter, HostBinding, Input, OnDestroy, Output } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';
import { Subscription } from 'rxjs';

import { ButtonDirective } from '../../button';
import { CalendarService } from '../calendar.service';

interface INavigationClick {
  direction: ('prev' | 'next');
  years: boolean;
}

@Component({
  selector: 'c-calendar-navigation',
  templateUrl: './calendar-navigation.component.html',
  styleUrls: ['./calendar-navigation.component.scss'],
  standalone: true,
  imports: [ButtonDirective, NgIf, NgStyle]
})
export class CalendarNavigationComponent implements OnDestroy {

  constructor(
    private calendarService: CalendarService
  ) {
    this.calendarStateSubscribe();
  }

  @Input() addMonths: number = 0;

  @Input()
  set calendarDate(value: Date) {
    this._calendarDate = value;
  };

  get calendarDate() {
    return this._calendarDate;
  }

  private _calendarDate = new Date();

  @Input() navigation: boolean = true;
  @Input() navYearFirst: boolean = false;

  locale: string = 'default';
  view: 'days' | 'months' | 'years' = 'days';

  @Output() navigationClick: EventEmitter<INavigationClick> = new EventEmitter<INavigationClick>();
  private calendarStateSubscription!: Subscription;

  get date() {
    return new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + this.addMonths);
  }

  @HostBinding('class')
  get hostClasses(): any {
    return {
      'calendar-nav': true
    };
  }

  ngOnDestroy(): void {
    this.calendarStateSubscribe(false);
  }

  calendarStateSubscribe(subscribe: boolean = true): void {
    if (subscribe) {
      this.calendarStateSubscription =
        this.calendarService.calendarState$.subscribe(state => {
          const keys = Object.keys(state);
          for (const key of keys) {
            if (key in this) {
              // @ts-ignore
              this[key] = state[key];
            }
          }
        });
      return;
    }
    this.calendarStateSubscription?.unsubscribe();
  }

  setView(view: 'days' | 'months' | 'years') {
    this.view = view;
    this.calendarService.update({ view: view });
  }

  handleNavigationClick(direction: 'prev' | 'next', years = false) {
    this.navigationClick.emit({ direction, years: years });
  }
}
