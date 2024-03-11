import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { formatDate, NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { BooleanInput, coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

import { Options } from '@popperjs/core';

import { ButtonDirective } from '../../button';
import { getLocalDateFromString, isDateDisabled, isValidDate } from '../../calendar/calendar.utils';
import { DateFilterType, DayFormatType, WeekdayFormatType } from '../../calendar/calendar.service';
import { CalendarComponent } from '../../calendar';
import { Colors } from '../../coreui.types';
import { DropdownComponent, DropdownMenuDirective, DropdownToggleDirective } from '../../dropdown';
import { FormControlDirective, InputGroupComponent, InputGroupTextDirective } from '../../form';
import { TemplateIdDirective } from '../../shared';
import { TimePickerComponent } from '../../time-picker';
import { CustomRangeKeyPipe } from './custom-range-key.pipe';

export interface ICalendarRanges {
  [key: string]: Date[];
}

export type TCustomRange = [string, Date[]]

/** Must be a valid date string */
// todo: validation
// export function invalidDateStringValidator(locale: string): ValidatorFn {
//   return (control: AbstractControl): ValidationErrors | null => {
//     // const validDate = !isNaN(Date.parse(control.value));
//     stringToDateConvert(control.value, locale);
//     const dateShim = cvtDate(control.value, locale);
//     // @ts-ignore
//     // control.setValue(new Date(dateShim.year, dateShim.month, dateShim.day))
//     console.log('dateShim', dateShim, locale);
//     const validDate = isValidDate(control.value);
//     console.log('invalidDateStringValidator', control, control.value, validDate);
//     return validDate ? { invalidDateStringValidator: { value: control.value } } : null;
//   };
// }

@Component({
  selector: 'c-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  exportAs: 'cDateRangePicker',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgForOf,
    NgTemplateOutlet,
    ReactiveFormsModule,
    CalendarComponent,
    TimePickerComponent,
    ButtonDirective,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    InputGroupComponent,
    FormControlDirective,
    InputGroupTextDirective,
    CustomRangeKeyPipe
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true
    }
  ]
})
export class DateRangePickerComponent implements OnInit, OnDestroy, ControlValueAccessor, AfterViewInit, OnChanges {

  static ngAcceptInputType_closeOnSelect: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_navYearFirst: BooleanInput;

  constructor(
    private breakpointObserver: BreakpointObserver
  ) { }

  /**
   * Set the format of day name.
   * @default 'numeric'
   * @type DayFormatType
   */
  @Input() dayFormat: DayFormatType = 'numeric';

  /**
   * The number of calendars that render on desktop devices.
   * @type number
   * @default 2
   */
  @Input()
  set calendars(value: number) {
    this._calendars = coerceNumberProperty(value);
  }

  get calendars() {
    return this._calendars;
  }

  private _calendars: number = 2;

  /**
   * Toggle visibility or set the content of the cleaner button.
   * @type boolean
   * @default true
   */
  @Input()
  set cleaner(value: boolean) {
    this._cleaner = coerceBooleanProperty(value);
  }

  get cleaner() {
    return this._cleaner;
  }

  private _cleaner: boolean = true;

  /**
   * Determine if the dropdown should be closed after value setting.
   * @type boolean
   * @default false
   */
  @Input()
  set closeOnSelect(value: boolean) {
    this.#closeOnSelect = coerceBooleanProperty(value);
  }

  get closeOnSelect() {
    return this.#closeOnSelect;
  }

  #closeOnSelect: boolean = false;

  /**
   * Set date format.
   * We use Angular formatDate() function, see:
   * - https://angular.io/api/common/formatDate
   * - https://angular.io/api/common/DatePipe#pre-defined-format-options
   */
  @Input()
  format?: string;

  /**
   * Toggle visibility or set the content of the input indicator.
   * @type boolean
   * @default true
   */
  @Input()
  set indicator(value: boolean) {
    this._indicator = coerceBooleanProperty(value);
  }

  get indicator() {
    return this._indicator;
  }

  private _indicator: boolean = true;

  /**
   * Toggle the readonly state for the component.
   * @type boolean
   * @default false
   */
  @Input()
  set inputReadOnly(value: boolean) {
    this._inputReadOnly = coerceBooleanProperty(value);
  }

  get inputReadOnly(): boolean {
    return this._inputReadOnly || typeof this.format === 'string';
  }

  private _inputReadOnly: boolean = false;

  /**
   * Reorder year-month navigation, and render year first.
   * @type boolean
   * @default false
   */
  @Input()
  set navYearFirst(value: boolean) {
    this._navYearFirst = coerceBooleanProperty(value);
  }

  get navYearFirst() {
    return this._navYearFirst;
  }

  private _navYearFirst: boolean = false;

  /**
   * Specifies short hints that are visible in start date and end date inputs.
   * type string
   */
  @Input() placeholder: string | string[] = ['Start date', 'End date'];

  /**
   * Predefined date ranges the user can select from.
   * @type ICalendarRanges
   */
  @Input() ranges?: object;

  /**
   * Sets the color context of the cancel button to one of CoreUI’s themed colors.
   * @type 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | string
   * @default 'secondary'
   */
  @Input() rangesButtonsColor?: Colors = 'secondary';

  /**
   * Size the ranges button small or large.
   * @type 'sm' | 'lg' | ''
   */
  @Input() rangesButtonsSize: 'sm' | 'lg' | '' = '';

  /**
   * Set the ranges button variant to an outlined button or a ghost button.
   * @type 'outline' | 'ghost' | undefined
   */
  @Input() rangesButtonsVariant?: 'outline' | 'ghost' = 'ghost';

  /**
   * Default icon or character that separates two dates.
   * @type boolean
   * @default true
   */
  @Input()
  set separator(value: boolean) {
    this._separator = coerceBooleanProperty(value);
  }

  get separator(): boolean {
    return this._separator;
  }

  private _separator: boolean = true;

  /**
   * Size the component small or large.
   * @type 'sm' | 'lg' | undefined
   * @default undefined
   */
  @Input() size?: 'sm' | 'lg';

  /**
   * Provide an additional time selection by adding select boxes to choose time.
   * @type boolean
   * @default false
   */
  @Input()
  set timepicker(value: boolean) {
    this._timepicker = coerceBooleanProperty(value);
  }

  get timepicker(): boolean {
    return false;
    // return this._timepicker;
  }

  private _timepicker: boolean = false;

  /**
   * Toggle visual validation feedback.
   * @type boolean | undefined
   * @default undefined
   */
  @Input() valid?: boolean;

  /**
   * Toggle the visibility of the dropdown date-picker component.
   * @type boolean
   * @default false
   */
  @Input()
  set visible(value: boolean) {
    this._visible = coerceBooleanProperty(value);
  }

  get visible(): boolean {
    return this._visible;
  }

  private _visible: boolean = false;

  @Input()
  set startDate(value) {
    const prevDate = this._startDate ? new Date(this._startDate) : null;
    this._startDate = value ? new Date(value) : null;
    if (prevDate?.getTime() !== this._startDate?.getTime()) {
      this.startDateValue = this.formatDate(this._startDate);
      this.startDateChange.emit(this._startDate);
    }
  }

  get startDate() {
    return this._startDate;
  }

  private _startDate?: Date | null;

  @Input()
  set endDate(value) {
    const prevDate = this._endDate ? new Date(this._endDate ?? 0) : null;
    this._endDate = value ? new Date(value) : null;
    if (prevDate?.getTime() !== this._endDate?.getTime()) {
      this.endDateValue = this.formatDate(this._endDate);
      this.endDateChange.emit(this._endDate);
    }
  }

  get endDate() {
    return this._endDate;
  }

  private _endDate?: Date | null;

  @Input() calendarDate: Date = new Date();
  @Input() disabledDates: Date[] | Date[][] = [];

  @Input()
  set firstDayOfWeek(value: number) {
    this._firstDayOfWeek = coerceNumberProperty(value);
  }

  get firstDayOfWeek() {
    return this._firstDayOfWeek;
  }

  private _firstDayOfWeek: number = 1;

  @Input() locale: string = 'default';
  @Input() maxDate: Date | null = null;
  @Input() minDate: Date | null = null;

  @Input()
  set navigation(value: boolean) {
    this._navigation = coerceBooleanProperty(value);
  }

  get navigation() {
    return this._navigation;
  }

  private _navigation: boolean = true;

  /**
   * Allow range selection.
   * @type boolean
   * @default false
   */
  @Input()
  set range(value: boolean) {
    this._range = coerceBooleanProperty(value);
  }

  get range(): boolean {
    return this._range;
  }

  private _range: boolean = true;

  @Input() dateFilter?: DateFilterType;

  @Input()
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.startDateInput.disable() : this.startDateInput.enable();
    this._disabled ? this.endDateInput.disable() : this.endDateInput.enable();
  }

  get disabled(): boolean {
    return this._disabled;
  }

  private _disabled = false;

  @Input()
  set value(value: any) {
    const newValue = this.range ? { ...value } : value;
    if (JSON.stringify(this._value) !== JSON.stringify(newValue)) {
      this._value = newValue;
      if (this.range) {
        this.handleStartDateChange(newValue.startDate ?? null);
        this.handleEndDateChange(newValue.endDate ?? null);
      } else {
        this.handleStartDateChange(newValue ?? null);
      }
      this.onChange(newValue);
      this.onTouched();
      this.valueChange.emit(this.value);
      if (this.closeOnSelect) {
        const hasValue = this.range ? !!(this.value.startDate && this.value.endDate) : !!this.value;
        this.visible = !hasValue;
      }
    }
  }

  get value() {
    return this._value;
  }

  private _value: any = {};

  /**
   * Set length or format of day name.
   * @type WeekdayFormatType
   * @default 'short'
   */
  @Input() weekdayFormat: WeekdayFormatType = 'short';

  /**
   * Optional popper Options object
   * @type Partial<Options>
   */
  @Input('popperOptions') popperjsOptions: Partial<Options> = {
    strategy: 'fixed'
  };

  /**
   * Set whether days in adjacent months shown before or after the current month are selectable. This only applies if the `showAdjacentDays` option is set to true.
   * @type boolean
   * @default false
   * @since 4.4.10
   */
  @Input()
  set selectAdjacentDays(value: boolean) {
    this.#selectAdjacentDays = coerceBooleanProperty(value);
  }

  get selectAdjacentDays(): boolean {
    return this.#selectAdjacentDays;
  }

  #selectAdjacentDays: boolean = false;

  /**
   * Set whether to display dates in adjacent months (non-selectable) at the start and end of the current month.
   * @type boolean
   * @default true
   * @since 4.4.10
   */
  @Input() showAdjacentDays: boolean = true;

  @Output() readonly valueChange = new EventEmitter<Date | Date[] | undefined>();

  @Output() calendarCellHover: EventEmitter<Date | null> = new EventEmitter<Date | null>();
  @Output() calendarDateChange: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() endDateChange: EventEmitter<Date | null> = new EventEmitter<Date | null>();
  @Output() startDateChange: EventEmitter<Date | null> = new EventEmitter<Date | null>();

  // @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;
  @ViewChild('startDateElementRef') startDateElementRef!: ElementRef<HTMLInputElement>;
  @ViewChild('endDateElementRef') endDateElementRef!: ElementRef<HTMLInputElement>;

  templates: any = {};
  @ContentChildren(TemplateIdDirective, { descendants: true }) contentTemplates!: QueryList<TemplateIdDirective>;

  protected dateChangeSubscriptions: Subscription[] = [];

  protected subscribeDateChange(subscribe: boolean = true): void {
    if (subscribe) {
      // todo
      // this.dateChangeSubscriptions.push(this.startDateChange.subscribe(next => {
      //   this.startDate = next;
      //   this.onChange(next);
      // }));
      // this.dateChangeSubscriptions.push(this.startDateChange.subscribe(next => {
      //   this.endDate = next;
      //   this.onChange(next);
      // }));
      return;
    }
    this.dateChangeSubscriptions.forEach(subscription => {
      subscription?.unsubscribe();
    });
  }

  @HostListener('focusout') onBlur() {
    this.onTouched();
  }

  public isMobile = true;
  public customRanges!: TCustomRange[];
  public showRanges: boolean = false;

  set startDateValue(value: string) {
    this.startDateInput.setValue(value);
    this._startDateValue = value;
  }

  get startDateValue(): string {
    return this._startDateValue;
  }

  private _startDateValue: string = this.formatDate(this.startDate);

  set endDateValue(value: string) {
    this.endDateInput.setValue(value);
    this._endDateValue = value;
  }

  get endDateValue(): string {
    return this._endDateValue;
  }

  public _endDateValue: string = this.formatDate(this.endDate);

  public get startDatePlaceholder(): string {
    return Array.isArray(this.placeholder) ? this.placeholder[0] : this.placeholder;
  };

  public get endDatePlaceholder(): string {
    return Array.isArray(this.placeholder) ? this.placeholder[1] : this.placeholder;
  };

  private layoutChanges!: Subscription;

  // todo: validation
  startDateInput = new FormControl({ value: this.startDateValue, disabled: this.disabled }, [
    Validators.required
    // Validators.minLength(8),
    // Validators.maxLength(10),
    // invalidDateStringValidator(this.locale)
  ]);
  endDateInput = new FormControl({ value: this.endDateValue, disabled: this.disabled }, [
    Validators.required
    // Validators.minLength(8),
    // Validators.maxLength(10),
    // invalidDateStringValidator(this.locale)
  ]);
  dateRangeGroup!: FormGroup;

  set inputStartHoverValue(value) {
    this._inputStartHoverValue = value;
  }

  get inputStartHoverValue() {
    return this._inputStartHoverValue;
  }

  private _inputStartHoverValue!: Date | null;

  set inputEndHoverValue(value) {
    this._inputEndHoverValue = value;
  }

  get inputEndHoverValue() {
    return this._inputEndHoverValue;
  }

  private _inputEndHoverValue!: Date | null;

  @HostBinding('class')
  get datePickerClasses() {
    return {
      'is-valid': this.valid === true,
      'is-invalid': this.valid === false
    };
  }

  formatDate(date: Date | null | undefined) {
    return !date || !isValidDate(date) ? '' :
           this.format ? formatDate(date, this.format, this.locale) :
           this.timepicker ? date.toLocaleString(this.locale) :
           date.toLocaleDateString(this.locale);
  }

  readonly #breakpoints = {
    OneCalendarRanges: '(min-width: 480px)',
    TwoCalendars: '(max-width: 650px)',
    TwoCalendarsRanges: '(max-width: 810px)'
  };

  ngOnInit(): void {
    this.customRanges = this.ranges ? Object.entries(this.ranges) : [];

    const breakpoints = this.#breakpoints;

    this.layoutChanges = this.breakpointObserver.observe([
      breakpoints.OneCalendarRanges,
      breakpoints.TwoCalendars,
      breakpoints.TwoCalendarsRanges
    ]).subscribe(result => {
      if (result.matches) {
        this.isMobile = (this.customRanges?.length > 0 && result.breakpoints[breakpoints.TwoCalendarsRanges]) || result.breakpoints[breakpoints.TwoCalendars];
        if (this.customRanges?.length > 0) {
          this.showRanges = !result.breakpoints[breakpoints.OneCalendarRanges];
        }
      }
    });

    this.startDateValue = this.formatDate(this.startDate);
    this.endDateValue = this.formatDate(this.endDate);
    this.subscribeDateChange();
  }

  ngOnDestroy() {
    this.layoutChanges?.unsubscribe();
    this.subscribeDateChange(false);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.contentTemplates.forEach((child: TemplateIdDirective) => {
        this.templates[child.id] = child.templateRef;
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date']) {
      // for date-picker component
      const date = this.convertValueToDate(changes['date']?.currentValue) ?? null;
      this.handleStartDateChange(date);
      this.calendarDate = date ?? this.calendarDate;
    }
    if (changes['startDate']) {
      const date = this.convertValueToDate(changes['startDate']?.currentValue) ?? null;
      this.handleStartDateChange(date);
      this.calendarDate = date ?? this.calendarDate;
    }
    if (changes['endDate']) {
      const date = this.convertValueToDate(changes['endDate']?.currentValue) ?? null;
      this.handleEndDateChange(date);
    }
    if (changes['locale']) {
      this.startDateValue = this.formatDate(this.startDate);
      this.endDateValue = this.formatDate(this.endDate);
    }
  }

  convertValueToDate(value: Date | string | number | undefined | null) {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      return getLocalDateFromString(value, this.locale, this.timepicker);
    }
    return new Date(value) ?? null;
  }

  getCustomRangeKey(customRange: any) {
    return customRange[0];
  }

  setCustomRange(customRange: any) {
    const key = this.getCustomRangeKey(customRange);
    this.handleStartDateChange(customRange[1][0]);
    this.handleEndDateChange(customRange[1][1]);
  }

  handleCalendarCellHover($event: Date | null) {
    this.calendarCellHover.emit($event);
    if (!this.startDate) {
      this.setInputValue(this.startDateElementRef, $event);
      this.inputStartHoverValue = $event;
      this.setInputValue(this.endDateElementRef, null);
      this.inputEndHoverValue = null;
      return;
    }
    if (!this.endDate) {
      this.setInputValue(this.endDateElementRef, $event);
      this.inputEndHoverValue = $event;
      return;
    }
  }

  handleCalendarDateChange($event: Date) {
    if (this.calendarDate.getTime() !== $event.getTime()) {
      this.calendarDateChange.emit($event);
    }
  }

  handleStartDateChange(date: Date | null) {
    if (date?.getTime() !== this.startDate?.getTime()) {
      this.startDate = date ?? null;
      this.startDateValue = this.formatDate(this.startDate);
      this.inputStartHoverValue = null;
      this.value = this.range ? { startDate: this.startDate, endDate: this.endDate } : this.startDate;
    }
  }

  handleEndDateChange(date: Date | null) {
    if (date?.getTime() !== this.endDate?.getTime()) {
      if (!this.range) {
        return;
      }
      this.endDate = date ?? null;
      this.endDateValue = this.formatDate(this.endDate);
      this.inputEndHoverValue = null;
      this.value = this.range ? { startDate: this.startDate, endDate: this.endDate } : this.startDate;
    }
  }

  handleClear($event?: MouseEvent) {
    // this.calendarComponent.clearDates();
    this.handleStartDateChange(null);
    this.handleEndDateChange(null);
  }

  handleStartDateInputChange($event: any) {
    const date = getLocalDateFromString($event.target?.value, this.locale, this.timepicker);
    if (!date) {
      // this.calendarComponent.clearDates();
      this.handleStartDateChange(null);
      this.handleEndDateChange(null);
    }
    if (date instanceof Date && date.getTime()) {
      if (!(this.forbiddenDate(date) || (this.endDate && this.endDate < date))) {
        this.calendarDate = date;
        this.startDate = date;
      }
    }
    this.handleStartDateChange(this.startDate ?? null);
  }

  handleEndDateInputChange($event: any) {
    const date = getLocalDateFromString($event.target?.value, this.locale, this.timepicker);
    if (!date) {
      this.endDate = null;
    }
    if (date instanceof Date && date.getTime()) {
      if (!(this.forbiddenDate(date) || (this.startDate && this.startDate > date))) {
        this.calendarDate = date;
        this.endDate = date;
      }
    }
    this.handleEndDateChange(this.endDate ?? null);
  }

  forbiddenDate(date: Date) {
    return isDateDisabled(date, this.minDate, this.maxDate, this.disabledDates) || (this.dateFilter ? !this.dateFilter(date) : false);
  }

  setInputValue = (elementRef: ElementRef, date: Date | null) => {
    if (!elementRef) {
      return;
    }
    elementRef.nativeElement.value = this.formatDate(date);
    // elementRef.nativeElement.valueAsDate = date;
    return;
  };

  onChange: any = (value: any) => {};
  onTouched: any = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: any): void {
    if (value !== null) {
      this.value = this.range ? { ...value } : value;
    }
  }

  handleStartTimeChange(time: Date | undefined) {
    this.startDate = time ?? this.startDate;
  }

  handleEndTimeChange(time: Date | undefined) {
    if (!this.range) {
      return;
    }
    this.endDate = time ?? this.endDate;
  }
}
