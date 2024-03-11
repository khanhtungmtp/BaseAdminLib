import {
  AfterViewInit,
  Component,
  ContentChildren,
  DestroyRef,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs/operators';

import {
  convert12hTo24h,
  convert24hTo12h,
  convertTimeToDate,
  DateTimeFormatOptions,
  DayPeriod,
  getAmPm,
  getDayPeriods,
  getListOfHours,
  getListOfMinutes,
  getListOfSeconds,
  isHour12,
  isValidTime,
  ITimeValue
} from './time.utils';
import { DropdownComponent, DropdownMenuDirective, DropdownToggleDirective } from '../dropdown';
import { FormControlDirective, FormSelectDirective, InputGroupComponent, InputGroupTextDirective } from '../form';
import { TemplateIdDirective } from '../shared';
import { TimePickerRollColComponent } from './time-picker-roll-col/time-picker-roll-col.component';
import { TimePickerRollAmPmComponent } from './time-picker-roll-col/time-picker-roll-am-pm.component';

@Component({
  selector: 'c-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  exportAs: 'cTimePicker',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgForOf,
    NgTemplateOutlet,
    ReactiveFormsModule,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    FormControlDirective,
    FormSelectDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    TimePickerRollColComponent,
    TimePickerRollAmPmComponent
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true
    }
  ]
})
export class TimePickerComponent implements OnChanges, OnInit, ControlValueAccessor, AfterViewInit {

  readonly #destroyRef = inject(DestroyRef);

  constructor() {}

  static ngAcceptInputType_cleaner: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_indicator: BooleanInput;
  static ngAcceptInputType_inputReadOnly: BooleanInput;
  static ngAcceptInputType_seconds: BooleanInput;
  static ngAcceptInputType_visible: BooleanInput;

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
   * Sets DateTime format options including timeZone
   * @type DateTimeFormatOptions
   * @default {}
   * @note The date object doesn't store timeZone, it keeps the local timezone of the browser, regardless if you parsed UTC dates.
   */
  @Input() dateTimeFormatOptions: DateTimeFormatOptions = {};

  /**
   * Toggle the disabled state for the component.
   * @type boolean
   * @default false
   */
  @Input()
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  get disabled(): boolean {
    return this._disabled;
  }

  private _disabled: boolean = false;

  /**
   * Filter available hours to pick.
   * @type (value: number) => boolean;
   * @default undefined
   */
  @Input() filterHours?: (value: number) => boolean;

  /**
   * Filter available minutes to pick.
   * @type (value: number) => boolean;
   * @default undefined
   */
  @Input() filterMinutes?: (value: number) => boolean;

  /**
   * Filter available seconds to pick.
   * @type (value: number) => boolean;
   * @default undefined
   */
  @Input() filterSeconds?: (value: number) => boolean;

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
    return this._inputReadOnly;
  }

  private _inputReadOnly: boolean = false;

  /**
   * Sets the default locale for components. If not set, it is inherited from the browser.
   * @type string
   * @default default
   */
  @Input() locale: string = 'default';

  /**
   * Specifies short hint visible in time input.
   * @type string
   * @default 'Select time'
   */
  @Input() placeholder: string = 'Select time';

  /**
   * Toggle seconds visibility.
   * @type boolean
   * @default false
   */
  @Input()
  set seconds(value: boolean) {
    this._seconds = coerceBooleanProperty(value);
  }

  get seconds(): boolean {
    return this._seconds;
  }

  private _seconds: boolean = false;

  /**
   * Size the component small or large.
   * @type 'sm' | 'lg' | undefined
   * @default undefined
   */
  @Input() size?: 'sm' | 'lg';

  /**
   * Initial selected time.
   * @type Date | string | null | number
   * @default undefined
   */
  @Input()
  set time(value: Date | string | undefined) {
    if (value && isValidTime(value)) {
      const time = convertTimeToDate(value);
      if (!time) {
        this.clearTime();
        return;
      }
      this.dayPeriod = getAmPm(time, this.locale);
      if (this._time?.getTime() !== time.getTime()) {
        this._time = new Date(time.getTime());
      }
    } else {
      this.clearTime();
    }
  }

  get time(): Date | undefined {
    return this._time;
  }

  private _time?: Date;
  private _timeInternal?: Date;

  /**
   * Set the time picker variant to a roll or select.
   * @type 'roll' | 'select'
   * @default 'roll'
   */
  @Input() variant: 'roll' | 'select' = 'roll';

  /**
   * Toggle visual validation feedback.
   * @type boolean | undefined
   * @default undefined
   */
  @Input() valid?: boolean;

  /**
   * Toggle the visibility of dropdown timepicker menu component.
   * @type boolean
   * @default false
   */
  @Input()
  set visible(value: boolean) {
    this._visible = coerceBooleanProperty(value);
  }

  get visible() {
    return this._visible;
  }

  private _visible: boolean = false;

  @Output() timeChange: EventEmitter<Date | undefined> = new EventEmitter<Date | undefined>(false);

  @HostListener('blur') onBlur() {
    this.onTouched();
  }

  @ViewChild(DropdownComponent, { read: ElementRef }) dropdownRef!: ElementRef;

  templates: any = {};
  @ContentChildren(TemplateIdDirective, { descendants: true })
  contentTemplates!: QueryList<TemplateIdDirective>;

  listOfHours!: ITimeValue[];
  listOfHours12!: ITimeValue[];
  listOfMinutes!: ITimeValue[];
  listOfSeconds!: ITimeValue[];
  hour12: boolean = isHour12(this.locale);
  dayPeriods = [
    { value: 'am', label: 'am' },
    { value: 'pm', label: 'pm' }
  ];

  set timeInputValue(value: string) {
    this.timeInput.setValue(value);
    this._timeInputValue = value;
  }

  get timeInputValue(): string {
    return this._timeInputValue;
  }

  private _timeInputValue: string =
    this.time?.toLocaleTimeString(this.locale, { timeStyle: this.seconds ? 'medium' : 'short' }) ??
    '';

  get timePickerClasses() {
    return {
      'form-control': this.variant === 'select' && this.valid !== undefined,
      'is-valid': this.valid === true,
      'is-invalid': this.valid === false
    };
  }

  selectTime = new FormGroup<{
    selectHours: FormControl<number | null>;
    selectMinutes: FormControl<number | null>;
    selectSeconds?: FormControl<number | null>;
    selectDayPeriod?: FormControl<'am' | 'pm' | null>;
  }>(
    {
      selectHours: new FormControl(
        { value: this.hour, disabled: this.disabled },
        { validators: [Validators.min(0), Validators.max(this.hour12 ? 11 : 23)] }
      ),
      selectMinutes: new FormControl(
        { value: this.minute, disabled: this.disabled },
        { validators: [Validators.min(0), Validators.max(59)] }
      ),
      selectSeconds: new FormControl(
        { value: this.second, disabled: this.disabled },
        { validators: [Validators.min(0), Validators.max(59)] }
      ),
      selectDayPeriod: new FormControl(
        { value: this.dayPeriod, disabled: this.disabled },
        Validators.required
      )
    },
    { validators: [Validators.required] }
  );

  timeInput = new FormControl(
    {
      value: this.timeInputValue,
      disabled: this.disabled
    },
    { validators: [Validators.required] }
  );

  set hour(value: number) {
    if (this._hour !== value) {
      if (value < 0) {
        this.clearTime();
        return;
      }
      this._hour = value;
    }
  }

  get hour(): number {
    return this._hour;
  }

  private _hour = -1;

  set minute(value: number) {
    if (this._minute !== value) {
      if (value < 0) {
        this.clearTime();
        return;
      }
      this._minute = value;
    }
  }

  get minute(): number {
    return this._minute;
  }

  private _minute = -1;

  set second(value: number) {
    if (this._second !== value) {
      if (value < 0) {
        this.clearTime();
        return;
      }
      this._second = value;
    }
  }

  get second(): number {
    return this._second;
  }

  private _second = -1;

  set dayPeriod(value) {
    this._dayPeriod = value;
    this.listOfHours12 = this.hour12
                         ? this.listOfHours?.filter(
        (item) => (item.dayPeriod && item.dayPeriod === value) || !item.dayPeriod
      )
                         : this.listOfHours;
    this.patchSelectTimeValues();
  }

  get dayPeriod() {
    return this._dayPeriod;
  }

  private _dayPeriod: DayPeriod = 'am';

  setTime() {
    this._hour = this._hour < 0 ? 0 : this._hour;
    this._minute = this._minute < 0 ? 0 : this._minute;
    this._second = this._second < 0 ? 0 : this._second;

    const time = new Date(this._time?.getTime() || new Date());
    time.setHours(this.hour, this.minute, this.second, 0);
    this.time = time;
    this.emitTime(time);
  }

  public clearTime() {
    if (this.time) {
      this._time = undefined;
      this.emitTime(undefined);
    }
    this._hour = -1;
    this._minute = -1;
    this._second = -1;
    this.dayPeriod = 'am';
    this.patchSelectTimeValues();
    this.timeInputValue = '';
  }

  emitTime(time: Date | undefined) {
    const timeValue = !!time && isValidTime(time) ? new Date(time.getTime()) : undefined;
    if (this._timeInternal?.getTime() !== timeValue?.getTime()) {
      this.timeChange.emit(timeValue);
      this.onChange(timeValue);
      this.onTouched();
      this._timeInternal = timeValue;
    }
    this.timeInputValue =
      this.time?.toLocaleTimeString(this.locale, {
        timeStyle: this.seconds ? 'medium' : 'short'
      }) ?? '';
  }

  ngOnInit(): void {
    this.setTimeLists();
    this.updateSelectTime();
    this.setChangeHandlers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['time']) {
      if (!changes['time'].firstChange) {
        if (this._timeInternal?.getTime() !== changes['time'].currentValue?.getTime()) {
          this.updateSelectTime();
        }
      }
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.contentTemplates.forEach((child: TemplateIdDirective) => {
        this.templates[child.id] = child.templateRef;
      });
    });
  }

  setTimeLists() {
    this.dayPeriods = getDayPeriods(this.locale, this.dateTimeFormatOptions);
    this.hour12 = isHour12(this.locale);
    this.listOfHours = this.listOfTimeSegments(getListOfHours, this.filterHours);
    this.listOfMinutes = this.listOfTimeSegments(getListOfMinutes, this.filterMinutes);
    this.listOfSeconds = this.listOfTimeSegments(getListOfSeconds, this.filterSeconds);
    if (this.variant === 'select') {
      const undefSegment = { value: -1, label: ' --', disabled: true };
      this.listOfHours.unshift({ ...undefSegment });
      this.listOfMinutes.unshift({ ...undefSegment });
      this.listOfSeconds.unshift({ ...undefSegment });
    }
    this.listOfHours12 = this.hour12
                         ? this.listOfHours.filter(
        (item) => (item.dayPeriod && item.dayPeriod === this.dayPeriod) || !item.dayPeriod
      )
                         : this.listOfHours;
  }

  updateSelectTime(time = this.time) {
    if (!!time && isValidTime(time)) {
      const hour = time.getHours() ?? 0;
      const minute = time.getMinutes() ?? 0;
      const second = this.seconds ? time.getSeconds() ?? 0 : 0;

      const closestSecond = this.closestTime(this.listOfSeconds, second);
      const closestMinute = this.closestTime(this.listOfMinutes, minute);
      const closestHour = this.closestTime(this.listOfHours, hour);

      this.second = this.seconds ? closestSecond.value : 0;
      this.minute = closestMinute.value;
      this.hour = closestHour.value;
      this.setTime();
      this.patchSelectTimeValues();
    }
  }

  closestTime(timeArray: ITimeValue[], timeSegment: number) {
    let array = timeArray ?? [{ value: 0, label: '00' }];
    if (this.time) {
      array = timeArray.filter((el) => el.value >= 0);
      array = array.length ? array : timeArray;
    }
    return array.reduce((a: ITimeValue, b: ITimeValue) => {
      return Math.abs(b.value - timeSegment) < Math.abs(a.value - timeSegment) ? b : a;
    });
  }

  listOfTimeSegments(
    getListOfTimeSegments: (
      locale: string,
      dateTimeFormatOptions: DateTimeFormatOptions
    ) => ITimeValue[],
    filterTimeSegments: ((timeSegmentValue: number) => boolean) | undefined
  ) {
    const list = getListOfTimeSegments(this.locale, this.dateTimeFormatOptions).filter(
      (segment: ITimeValue) => {
        return typeof filterTimeSegments === 'function' ? filterTimeSegments(segment.value) : true;
      }
    );
    return list.length
           ? list
           : getListOfTimeSegments(this.locale, this.dateTimeFormatOptions).slice(0, 1);
  }

  handleSelectDayPeriodChange(dayPeriod: DayPeriod) {
    if (dayPeriod !== this.dayPeriod) {
      const hrs = this.time?.getHours() ?? (this.hour < 0 ? 0 : this.hour);
      const hour = hrs > 12 ? convert24hTo12h(hrs) : convert12hTo24h(dayPeriod, hrs);
      this.hour = this.closestTime(this.listOfHours, hour).value;
      if (hour >= 0) {
        this.setTime();
      }
      this.updateSelectTime();
    }
  }

  handleSelectHoursChange(hour: number) {
    this.hour = hour;
    if (hour >= 0) {
      this.setTime();
    }
    this.updateSelectTime();
  }

  handleSelectMinutesChange(minute: number) {
    this.minute = minute;
    if (minute >= 0) {
      this.setTime();
    }
    this.updateSelectTime();
  }

  handleSelectSecondsChange(second: number) {
    this.second = second;
    if (second >= 0) {
      this.setTime();
    }
    this.updateSelectTime();
  }

  patchSelectTimeValues() {
    const dayPeriod = this.selectTime.get('selectDayPeriod')?.value;
    if (this.dayPeriod !== dayPeriod) {
      this.selectTime.patchValue({
        selectDayPeriod: this.dayPeriod ?? 'am'
      });
    }
    const hours = this.selectTime.get('selectHours')?.value;
    const minutes = this.selectTime.get('selectMinutes')?.value;
    const seconds = this.selectTime.get('selectSeconds')?.value;
    const goUpdate =
      (this.second < 0 && this.minute < 0) ||
      (this.hour >= 0 && this.minute >= 0 && this.second >= 0);
    const timeChanged = this.hour !== hours || this.minute !== minutes || this.second !== seconds;
    if (goUpdate && timeChanged) {
      if (this.hour !== hours) {
        this.selectTime.patchValue({
          selectHours: this.hour ?? 0
        });
      }
      if (this.minute !== minutes) {
        this.selectTime.patchValue({
          selectMinutes: this.minute ?? 0
        });
      }
      if (this.second !== seconds) {
        this.selectTime.patchValue({
          selectSeconds: this.second ?? 0
        });
      }
    }
  }

  trackByHour(index: number, hour: ITimeValue) {
    return hour;
  }

  onChange = (value: Date | undefined) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.time = value;
    this.updateSelectTime();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  handleTimeInputChange($event: any) {
    const value = $event.target?.value;
    if (!value || !isValidTime(value)) {
      this.clearTime();
      return;
    }
    const time = convertTimeToDate(value);
    this.updateSelectTime(time ?? new Date(Date.now()));
  }

  handleClear($event: MouseEvent) {
    this.clearTime();
  }

  handleBlur($event: FocusEvent) {
    if (this.disabled) {
      return;
    }
    this.dropdownRef?.nativeElement?.classList.remove('show');
    setTimeout(() => {
      this.onBlur();
    }, 100);
  }

  handleFocus($event: FocusEvent) {
    if (this.disabled) {
      return;
    }
    this.dropdownRef?.nativeElement?.classList.add('show');
  }

  setChangeHandlers() {

    if (this.variant !== 'select') {
      return;
    }

    this.selectTime.get('selectHours')?.valueChanges
      .pipe(
        tap(value => {
          this.handleSelectHoursChange(<number>value);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();

    this.selectTime.get('selectMinutes')?.valueChanges
      .pipe(
        tap(value => {
          this.handleSelectMinutesChange(<number>value);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();

    this.selectTime.get('selectSeconds')?.valueChanges
      .pipe(
        filter(() => this.seconds),
        tap(value => {
          this.handleSelectSecondsChange(<number>value);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();

    this.selectTime.get('selectDayPeriod')?.valueChanges
      .pipe(
        filter(() => this.hour12),
        tap(value => {
          this.handleSelectDayPeriodChange(<DayPeriod>value);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }
}
