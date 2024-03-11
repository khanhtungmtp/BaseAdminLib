import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  DestroyRef,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  inject,
  Input,
  IterableDiffer,
  IterableDiffers,
  NgZone,
  numberAttribute,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  Renderer2,
  signal,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, I18nPluralPipe, NgClass, NgStyle, NgTemplateOutlet } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusableOption, FocusKeyManager, FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, Observable, skip, Subject, Subscription } from 'rxjs';
import { combineLatestWith, debounceTime, delay, distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import { Modifier, ModifierArguments, Options } from '@popperjs/core';

import {
  DropdownComponent,
  DropdownDividerDirective,
  DropdownMenuDirective,
  DropdownToggleDirective
} from '../../dropdown';
import { ElementCoverComponent } from '../../element-cover';
import { TemplateIdDirective } from '../../shared';
import { IMultiSelect, IOption, OptionsMap, SearchFn } from '../multi-select.type';
import { MultiSelectService } from '../multi-select.service';
import { MultiSelectOptionComponent } from '../multi-select-option/multi-select-option.component';
import { MultiSelectNativeSelectComponent } from '../multi-select-native-select/multi-select-native-select.component';
import { MultiSelectTagComponent } from '../multi-select-tag/multi-select-tag.component';
import { MultiSelectSearchDirective } from './multi-select-search.directive';

interface IPluralMap {
  [k: string]: string;
}

// @ts-ignore
export const observeReferenceModifier: Modifier<string, any> = {
  name: 'observeReferenceModifier', enabled: true, phase: 'main', fn({ state }) {},

  effect: ({ state, instance }: ModifierArguments<Options>) => {
    const RO_PROP = '__popperjsRO__';
    const { reference } = state.elements;

    // @ts-ignore
    reference[RO_PROP] = new ResizeObserver((entries) => {
      instance.update();
    });

    // @ts-ignore
    reference[RO_PROP]?.observe(reference);
    return () => {
      // @ts-ignore
      reference[RO_PROP]?.disconnect();
      // @ts-ignore
      delete reference[RO_PROP];
    };
  }
};

@Component({
  selector: 'c-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  exportAs: 'cMultiSelect',
  providers: [
    I18nPluralPipe,
    MultiSelectService,
    {
      provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiSelectComponent), multi: true
    }
  ],
  standalone: true,
  imports: [
    AsyncPipe,
    I18nPluralPipe,
    NgClass,
    NgStyle,
    NgTemplateOutlet,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    FormsModule,
    MultiSelectTagComponent,
    MultiSelectOptionComponent,
    MultiSelectSearchDirective,
    DropdownComponent,
    DropdownDividerDirective,
    DropdownMenuDirective,
    DropdownToggleDirective,
    ElementCoverComponent
  ]
})
export class MultiSelectComponent<TValue extends string | number> implements IMultiSelect<TValue>, ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy, OnInit {

  readonly #destroyRef = inject(DestroyRef);
  readonly #i18nPlural = inject(I18nPluralPipe);

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private focusMonitor: FocusMonitor,
    private multiSelectService: MultiSelectService,
    private iterableDiffers: IterableDiffers
  ) {
    this.differ = this.iterableDiffers.find(this.#value).create();
    this.multiSelectService.setSelectionModel(this.multiple);
    this.optionsArray$ = this.multiSelectService.getOptionsArray();
  }

  private readonly differ!: IterableDiffer<any>;

  readonly #destroy$ = new Subject<void>();
  readonly #optionsReady$ = new Subject<void>();
  readonly optionsArray$!: Observable<IOption[]>;
  readonly userOptionsArray$ = new BehaviorSubject<IOption[]>([]);
  readonly #options: OptionsMap<string|number> = new Map();
  readonly optionsSelected$ = new BehaviorSubject<IOption[]>([]);
  readonly optionsSelected: Map<any, IOption> = new Map();
  readonly value$ = new BehaviorSubject<TValue[]>([]);
  #optionsContent: any[] = [];

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: TValue | TValue[]): void {
    if ((value !== undefined && value !== null)) {
      this.value = Array.isArray(value) ? [...value] : [value];
    } else {
      this.value = Array(0);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * Allow users to create options if they are not in the list of options.
   * @type boolean
   * @default false
   * @since 4.5.11
   */
  @Input({ transform: booleanAttribute }) allowCreateOptions: boolean = false;

  /**
   * Enables selection cleaner element
   * @type boolean
   * @default true | 'active'
   */
  @Input() cleaner: boolean | 'active' = true;

  /**
   * Clear current search on selecting an item
   * @type boolean
   * @default false
   * @since 4.5.11
   */
  @Input({ transform: booleanAttribute }) clearSearchOnSelect: boolean = false;

  /**
   * Disables multi-select component
   * @type boolean
   * @default false
   */
  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    if (this._disabled !== value) {
      this._disabled = value;
      this.setFocusMonitor(!value);
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  private _disabled = false;

  /**
   * Add loading spinner and reduced opacity.
   * @type boolean
   * @default false
   * @since 4.5.2
   */
  @Input({ transform: booleanAttribute })
  set loading(value: boolean) {
    this.isLoading.set(value);
  }

  isLoading = signal(false);

  /**
   * Specifies that multiple options can be selected at once
   * @type boolean
   * @default false
   */
  @Input({ transform: booleanAttribute })
  set multiple(value: boolean) {
    this._multiple = value;
    this.multiSelectService.setSelectionModel(this._multiple);
  }

  get multiple(): boolean {
    return this._multiple;
  }

  private _multiple = false;

  /**
   * Hidden native select form
   * @type string
   * @default ''
   */
  @Input() nativeFormId: string = '';

  /**
   * Hidden native select id
   * @type string
   * @default ''
   */
  @Input() nativeId: string = '';

  /**
   * Hidden native select name
   * @type string
   * @default ''
   */
  @Input() nativeName: string = '';

  /**
   * List of option elements
   * @type IOption[]
   * @default []
   */
  @Input()
  set options(options: IOption[]) {
    if (Array.isArray(options)) {
      this.#options.clear();
      this.makeOptions(options);
    }
  }

  get options() {
    return [...this.#options.values()];
  }

  /**
   * Sets maxHeight of options list in px
   * @type string | number
   * @default 'auto'
   */
  @Input() optionsMaxHeight: string | number = 'auto';

  /**
   * Sets option style
   * @type 'checkbox' | 'text'
   * @default 'checkbox'
   */
  @Input()
  set optionsStyle(value: 'checkbox' | 'text') {
    this.multiSelectService.optionsStyle = value ?? 'checkbox';
  }

  /**
   * Specifies a short hint that is visible in the search input
   * @type string
   * @default 'Select...'
   */
  @Input() placeholder: string = 'Select...';

  /**
   * Enables search input element
   * @type boolean | SearchFn | 'external'
   * @default true
   */
  @Input() search: (boolean | 'external' | SearchFn) = true;

  /**
   * Sets the label for no results when filtering
   * @type string
   * @default 'no items'
   */
  @Input() searchNoResultsLabel: string = 'no items';

  /**
   * Sets initial search string
   * @type string
   * @default ''
   */
  @Input()
  set searchValue(value) {
    if (this._searchValue !== value.trimStart()) {
      this._searchValue = value.trimStart();
      this.visible = this.searchValue.length > 0 && this.subtreeFocused ? true : this.visible;
      this.filterOptions(this.searchValue);
      this.inputElementSize();
      this.searchValueChange.emit(this._searchValue);
    }
  }

  get searchValue() {
    return this._searchValue;
  }

  private _searchValue: string = '';

  /**
   * Emits searchValue string for external filtering
   * @type string
   */
  @Output() readonly searchValueChange: EventEmitter<string> = new EventEmitter<string>();

  /**
   * Enables select all button
   * @type boolean
   * @default true
   */
  @Input() selectAll: boolean = true;

  /**
   * Sets the select all button label
   * @type string
   * @default 'Select all options'
   */
  @Input() selectAllLabel: string = 'Select all options';

  /**
   * Selection type
   * @type 'counter' | 'tags' | 'text'
   * @default 'tags'
   */
  @Input() selectionType: 'counter' | 'tags' | 'text' = 'tags';

  /**
   * Counter selection label value
   * @type string
   * @default 'item(s) selected'
   */
  @Input() selectionTypeCounterText: string = 'item(s) selected';

  /**
   * Counter selection label plural map for I18nPluralPipe
   * @type IPluralMap
   * @default { '=1': 'item selected', 'other': 'items selected' }
   */
  @Input() selectionTypeCounterTextPluralMap?: IPluralMap = { '=1': 'item selected', 'other': 'items selected' };

  /**
   * Size the component small or large.
   * @type 'sm' | 'lg' | undefined
   */
  @Input() size?: 'sm' | 'lg';

  /**
   * Initial value of multi-select
   * @type TValue | TValue[]
   */
  @Input() set value(value: TValue | TValue[]) {
    const newValue = Array.isArray(value) ? [...value] : [value];
    if (this.differ) {
      const changes = this.differ.diff(newValue);
      if (changes) {
        this.#value = [...newValue];
        this.value$.next([...newValue]);
        this.onChange(this.value);
        // this.valueChange.emit(this.value);
      }
    }
  }

  get value(): TValue | TValue[] {
    const value: TValue[] = this.multiSelectService.selectionModel?.selected ?? [...this.#value];
    return this.multiple ? [...value] : value[0];
  }

  #value: TValue[] = [];

  /**
   * Emits valueChange
   * @type TValue | TValue[]
   */
  @Output() readonly valueChange: EventEmitter<TValue | TValue[]> = new EventEmitter<TValue | TValue[]>();

  /**
   * Toggle visual validation feedback.
   * @type boolean | undefined
   * @default undefined
   */
  @Input() valid?: boolean;

  /**
   * Enable virtual scroller for options list.
   * @type boolean
   * @default false
   */
  @Input({ transform: booleanAttribute })
  set virtualScroller(value: boolean) {
    this._virtualScroller = value;
  }

  get virtualScroller() {
    return this._virtualScroller;
  }

  private _virtualScroller = false;

  /**
   * Amount of visible options, if set - overwrites optionsMaxHeight
   * @type number
   * @default 8
   */
  @Input({ transform: numberAttribute })
  set visibleItems(value) {
    this._visibleItems = value > 0 ? value : 8;
    this.optionsMaxHeight = ((this.itemSize * this._visibleItems) + 16).toString();
  }

  get visibleItems() {
    return this._visibleItems;
  }

  private _visibleItems = 8;

  /**
   * The size of the option item in the list (in pixels).
   * @type number
   * @default 40
   */
  @Input() itemSize: number = 40;

  /**
   * Min width of the options list (in pixels).
   * @type number
   * @default 196
   */
  @Input() itemMinWidth: number = 196;

  /**
   * Toggle the visibility of the dropdown select component.
   * @type boolean
   * @default false
   */
  @Input({ transform: booleanAttribute })
  set visible(value: boolean) {
    if (value !== this._visible) {
      this._visible = value;
      setTimeout(() => {
        this.multiSelectService.toggleVisible(value);
      });
      if (!value) {
        // this.searchValue = '';
      }
    }
  }

  get visible() {
    return this._visible;
  }

  private _visible = false;

  /**
   * Emits visibleChange
   * @type boolean
   */
  @Output() readonly visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * Optional popper Options object
   * @type Partial<Options>
   */
  @Input('popperOptions') popperjsOptions: Partial<Options> = {
    strategy: 'fixed', modifiers: [observeReferenceModifier, {
      name: 'offset', options: {
        offset: () => this.selectionType === 'tags' && this.optionsSelected.size ? [-2, 8] : [-12, 12]
      }
    }]
  };

  isDropdownVisible = false;

  get selectedOptions() {
    return [...this.optionsSelected.values()];
  }

  get selectedOptionsText() {
    return this.selectedOptions.map(option => option.label).join(', ');
  }

  get counterText() {
    return `${this.selectedOptions.length} ${this.selectionTypeCounterText}`;
  }

  get counterTextType(): string {
    return typeof this.selectionTypeCounterTextPluralMap ?? typeof this.selectionTypeCounterText;
  };

  get counterPlaceholderText() {
    if (this.selectedOptions.length === 0 || this.selectionType !== 'counter') {
      return null;
    }
    if (this.counterTextType === 'string') {
      return this.counterText;
    } else {
      return `${this.selectedOptions.length} ${this.#i18nPlural.transform(this.selectedOptions.length, this.selectionTypeCounterTextPluralMap ?? { other: this.selectionTypeCounterText ?? '+' })}`;
    }
  }

  private focusMonitorSubscription!: Subscription;

  @ContentChildren(MultiSelectOptionComponent, { descendants: true }) multiSelectOptionsContent!: QueryList<MultiSelectOptionComponent>;
  @ViewChildren(MultiSelectOptionComponent) multiSelectOptionsView!: QueryList<MultiSelectOptionComponent>;
  @ViewChildren('scrollViewport') scrollViewportView!: QueryList<CdkVirtualScrollViewport>;
  @ViewChild('options') optionsElementRef!: ElementRef;

  protected scrollViewport!: CdkVirtualScrollViewport;

  protected templates: { [id: string]: TemplateRef<any> } = {};
  @ContentChildren(TemplateIdDirective, { descendants: true }) contentTemplates!: QueryList<TemplateIdDirective>;

  private focusKeyManager!: FocusKeyManager<MultiSelectOptionComponent>;

  @ViewChild('inputElement') inputElement!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  @ViewChild(DropdownComponent, { read: ElementRef }) dropdown!: ElementRef;
  @ViewChild(DropdownToggleDirective, { read: ElementRef }) dropdownToggle!: ElementRef;

  @HostBinding('class')
  get hostClasses() {
    return {
      disabled: this.disabled
    };
  }

  get multiselectClasses() {
    return {
      'form-multi-select': true,
      'form-multi-select-selection-tags': this.selectionType === 'tags' && this.optionsSelected.size > 0,
      [`form-multi-select-${this.size}`]: !!this.size,
      'form-multi-select-with-cleaner': this.cleaner,
      'multiple': this.multiple,
      [`${this.selectionType}`]: this.selectionType,
      show: this.visible,
      disabled: this.disabled,
      'is-valid': this.valid === true,
      'is-invalid': this.valid === false
    };
  }

  @HostBinding('attr.aria-multiselectable')
  private get ariaMultiSelectable() {
    return this.multiple;
  }

  @HostBinding('attr.aria-expanded')
  private get ariaExpanded() {
    return this.visible;
  }

  @HostBinding('attr.tabindex')
  private get tabIndex() {
    return this._tabIndex;
  }

  private set tabIndex(value) {
    setTimeout(() => {
      this._tabIndex = this.disabled || this.search ? -1 : value === null ? null : 0;
    });
  }

  private _tabIndex: number | null = -1;

  @HostListener('keyup', ['$event']) onKeyUp($event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }
    this.onTouched();
    const targetTagName = ($event.target as HTMLElement).tagName;
    if ($event.key === 'Escape') {
      this.visible = false;
      this.searchValue = '';
      this.setFocus('keyboard', 'onKeyUp');
      return;
    }
    if (['Enter', 'Space', 'ArrowDown'].includes($event.code) && [this.inputElement?.nativeElement, this.elementRef.nativeElement].includes($event.target)) {
      $event.stopPropagation();
      this.visible = true;
      if (!this.search) {
        this.setFocus('keyboard', 'onKeyUp');
      }
      return;
    }

    if (['Tab'].includes($event.key)) {

      if ($event.target === this.elementRef.nativeElement) {
        this.visible = true;
        if (!this.search) {
          this.setFocus('keyboard', 'onKeyUp');
        }
        this.tabTarget = targetTagName;
        return;
      }

      if (this.visible && this.subtreeFocused) {
        if (targetTagName === 'C-MULTI-SELECT-OPTION') {

          if (this.tabTarget === 'C-MULTI-SELECT-OPTION') {
            if ($event.shiftKey && this.focusKeyManager.activeItem?.value === this.options.filter(option => option.visible && !option.disabled).slice(0)[0].value) {
              this.setFocus('keyboard', 'onKeyUp');
              this.tabTarget = targetTagName;
              return;
            }

            if (!$event.shiftKey && this.focusKeyManager.activeItem?.value === this.options.filter(option => option.visible && !option.disabled).slice(-1)[0].value) {
              this.setFocus('keyboard', 'onKeyUp');
              this.tabTarget = targetTagName;
              this.updateActiveItem(0);
              return;
            }
          }

          if (!this.focusKeyManager.activeItem || this.tabTarget !== targetTagName) {
            if (this.activeOption) {
              this.focusKeyManager.setActiveItem(this.activeOption);
            } else {
              this.setFirstItemActive();
            }
          } else {
            $event.shiftKey ? this.focusKeyManager.setPreviousItemActive() : this.focusKeyManager.setNextItemActive();
          }
        }
        this.tabTarget = targetTagName;
        return;
      }
    }
  }

  @HostListener('keydown', ['$event']) onKeyDown($event: KeyboardEvent) {
    const targetTagName = ($event.target as HTMLElement).tagName;
    if ($event.key === 'Enter' && targetTagName === 'INPUT') {
      $event.preventDefault();
    }
    if ($event.key === 'Tab') {
      this.tabTarget = targetTagName;
      return;
    }
    if ($event.key === 'ArrowDown' && targetTagName !== 'C-MULTI-SELECT-OPTION') {
      $event.preventDefault();
      return;
    }
    if ($event.key === 'Escape') {
      this.visible = false;
      this.searchValue = '';
      this.setFocus('keyboard', 'onKeyDown');
      return;
    }
    if (this.disabled) {
      return;
    }
    // avoid setting focus to option while on input element
    if ($event.target === this.inputElement?.nativeElement) {
      return;
    }
    if ($event.key !== 'Tab') {
      this.focusKeyManager?.onKeydown($event);
    }
  }

  @HostListener('click', ['$event'])
  onClick($event: MouseEvent): void {
    if (this.disabled) {
      return;
    }
    if ([this.dropdown.nativeElement].includes($event.target)) {
      this.visible = !this.visible;
    } else {
      this.visible = true;
    }
    this.onTouched();
    this.setFocus('mouse', 'onClick');
  }

  public visibleOptions = signal(false);

  get subtreeFocused() {
    return this._subtreeFocused;
  }

  set subtreeFocused(focused: boolean) {
    this._subtreeFocused = this.disabled ? false : focused;
    if (!focused) {
      this.searchValue = '';
    }
    if (!this.virtualScroller) {
      this.visible = focused === false ? false : this.visible;
    }
  }

  private _subtreeFocused = this.focusOrigin(null);

  private nativeSelectRef!: any;

  focusOrigin(origin: FocusOrigin): boolean {
    if (this.disabled) {
      return false;
    }
    return !!origin;
  }

  ngOnInit(): void {

    this.multiSelectService.selectionModel.changed
      .pipe(
        filter(() => !this.multiple),
        delay(0),
        tap(change => {
          if (change.added.length > 0) {
            // close dropdown for single select (!multiple)
            this.visible = false;
            this.searchValue = '';
          }
        }),
        skip(1),
        tap(change => {
          this.setFocus('program', 'selectionModel.changed (single)');
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();

    this.#optionsReady$.pipe(
      filter(() => !this.virtualScroller),
      delay(0),
      tap(() => {
        this.setFocusKeyManager([...this.multiSelectOptionsContent, ...this.multiSelectOptionsView]);
      }),
      takeUntilDestroyed(this.#destroyRef)
    ).subscribe();

    this.multiSelectService.selectionModel.changed
      .pipe(
        tap(change => {
          const { added } = { ...change };
          if (added.length > 0 && this.clearSearchOnSelect) {
            this.searchValue = '';
          }
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();

    this.multiSelectService.selectionModel.changed
      .pipe(
        // delay(0),
        combineLatestWith(this.#optionsReady$),
        tap(([change, ready]) => {
          const { removed } = { ...change };
          removed.forEach(value => {
            this.optionsSelected.delete(value);
          });
          this.multiSelectService.selectionModel.selected.forEach(key => {
            const value = this.#options.get(key);
            if (value) {
              this.optionsSelected.set(key, value);
            }
          });

          this.optionsSelected$.next(Array.from(this.optionsSelected.values()));
          this.value = [...this.multiSelectService.selectionModel.selected];

          this.inputElementSize();
          this.updateNativeSelect();
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();

    // set initial values
    this.multiSelectService.selectionModel.select(...this.#value);

    this.value$
      .pipe(
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(value => {
        if (!value.length) {
          this.clearAllOptions();
          return;
        }

        value.forEach(value => {
          this.multiSelectService.selectionModel.select(value);
        });
      });

    this.value$
      .pipe(
        debounceTime(100),
        tap(value => {
          this.valueChange.emit(this.value);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();

    this.multiSelectService.optionsArray$
      .pipe(
        combineLatestWith(this.userOptionsArray$),
        tap(([options, userOptions]) => {

          this.visibleOptions.set(options.some((item) => item.visible) || userOptions.some((item) => item.visible));
          this.activeOption = null;

          if (this.virtualScroller) {
            this.multiSelectOptionsContent?.forEach(option => {
              option.active = false;
            });
            this.scrollViewport?.setRenderedRange({ start: 0, end: this.visibleItems });
            this.scrollViewport?.scrollToIndex(0);
          } else {
            this.multiSelectOptionsContent?.forEach(option => {
              const found = options.find(item => item.value === option.value);
              option.visible = found?.visible ?? false;
              option.active = false;
            });
            const firstFocusable = this.firstFocusableItem;
            if (firstFocusable) {
              this.updateActiveItem(firstFocusable);
            }
          }
          if (!this.activeOption) {
            setTimeout(() => {
              this.updateActiveItem(0);
            });
          }
          this.multiSelectOptionsContent?.notifyOnChanges();
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();

    this.tabIndex = 0;
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
    this.setFocusMonitor(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const valueChanges = changes['value'];
      if (valueChanges.currentValue.length === 0) {
        this.clearAllOptions();
      }
      this.inputElementSize();
    }
  }

  makeOptions(options: IOption[]) {

    if (this.search === 'external' && this.searchValue.length) {
      this.#options.forEach((value, key) => {
        value.visible = false;
      });
    }

    options.forEach(option => {
      const key = option.value;
      const value = {
        value: option.value ?? option.label,
        label: option.label ?? option.value?.toString(),
        disabled: option.disabled === true,
        visible: this.search === 'external' ? true : option.custom && option.selected ? option.visible : option.visible !== false,
        text: option.text ?? option.label ?? option.value?.toString(),
        selected: option.selected,
        custom: option.custom
        // selected: this.multiSelectService.selectionModel.isSelected(option.value),
        // id: option.id
      };
      this.#options.set(key, { ...value });
    });

    this.filterOptions(this.searchValue);

    this.multiSelectOptionsContent?.notifyOnChanges();
    this.multiSelectOptionsView?.notifyOnChanges();
    this.#optionsReady$.next();
  }

  userOptions = this.multiSelectService.getUserOptions();

  // #effectUserOptions = effect(() => {
  //   if (this.allowCreateOptions) {
  //     this.userOptionsArray$.next(Array.from(this.userOptions().filter(option => option.visible)));
  //   }
  // });

  addUserOption() {
    if (this.allowCreateOptions) {
      if (this.userOptions().some(option => option.value === this.searchValue)) {
        return;
      }
      if (this.#options.get(this.searchValue)) {
        return;
      }
      const userOption: IOption = {
        value: this.searchValue,
        label: this.searchValue,
        text: this.searchValue,
        visible: true,
        custom: true,
        selected: true
      };
      this.searchValue = (this.clearSearchOnSelect || this.allowCreateOptions) ? '' : this.searchValue;
      this.multiSelectService.addUserOption(userOption);
      this.multiSelectService.selectionModel.select(userOption.value);
      this.optionsSelected.set(userOption.value, userOption);
      this.makeOptions([...this.options, ...this.userOptions()]);
    }
  }

  removeAllUserOptions() {
    this.multiSelectService.removeAllUserOptions();
  }

  ngAfterViewInit(): void {

    this.setVirtualScroller();

    this.multiSelectOptionsContent?.changes
      .pipe(
        delay(0),
        distinctUntilChanged((previous: QueryList<MultiSelectOptionComponent>, current) => {
          const prev = previous.toArray().map(option => option.value);
          const curr = current.toArray().map(option => option.value);
          if (this.virtualScroller) {
            return JSON.stringify(prev) === JSON.stringify(curr);
          }
          return JSON.stringify(this.#optionsContent) === JSON.stringify(curr);
        }),
        tap(changes => {
          this.#optionsContent = changes.toArray().map(option => option.value);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(next => {
        this.visibleOptions.set(this.multiSelectOptionsContent?.some((option) => option.visible));
        if (this.visibleOptions()) {
          this.makeOptions(this.multiSelectOptionsContent.toArray());
        }
      });

    this.visibleOptions.set(this.multiSelectOptionsContent?.length > 0 || this.multiSelectOptionsView?.length > 0);
    if (this.visibleOptions()) {
      this.multiSelectOptionsContent.notifyOnChanges();
    }

    this.multiselectSubscribe();

    this.setFocusMonitor(!this.disabled);

    this.setListKeyManager();

    this.inputElementSize();

    this.multiSelectOptionsContent.notifyOnChanges();

    setTimeout(() => {
      this.createNativeSelect();
    });

    this.multiSelectService.multiSelectFocus$
      .pipe(
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((option: MultiSelectOptionComponent) => {
          if (this.activeOption && this.activeOption.value !== option.value) {
            this.focusKeyManager.setActiveItem(option);
          }
        }
      );
  }

  private tabTarget!: string;

  private multiselectSubscribe(subscribe: boolean = true) {

    this.multiSelectService.multiSelectVisible$
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe((visible) => {
        if (this.isDropdownVisible !== visible) {
          this.isDropdownVisible = visible;
          this.visibleChange.emit(visible);
          if (!visible) {
          } else {
            if (this.virtualScroller) {
              this.scrollViewport?.setRenderedRange({ start: 0, end: this.visibleItems });
              this.scrollViewport?.scrollToIndex(0);
            }
          }
          this.multiSelectOptionsContent.notifyOnChanges();
        }
        this.updateActiveItem(0);
      });

  }

  clearAllOptions($event?: MouseEvent) {
    setTimeout(() => {
      const enabledOptions = Array.from(this.optionsSelected.values()).filter(option => !option.disabled).map(option => option.value);
      this.multiSelectService.selectionModel.deselect(...enabledOptions);
      this.removeAllUserOptions();
    });

    this.searchValue = '';
    if ($event) {
      this.setFocus('program', 'clearAllOptions');
    }
  }

  selectAllOptions() {
    const enabledOptions = Array.from(this.#options.values()).filter(option => option.visible && !option.disabled).map(option => option.value);
    this.multiSelectService.selectionModel.select(...enabledOptions);
    this.inputElementSize();
  }

  handleTagRemove(value: any) {
    this.multiSelectService.selectionModel.deselect(value);
    this.setFocus('program', 'handleTagRemove');
  }

  setFocus(origin: FocusOrigin = 'program', methodName?: string) {
    if (this.disabled) {
      return;
    }
    const element = <HTMLElement>(this.inputElement?.nativeElement ?? this.elementRef.nativeElement);
    const preventScroll = origin === 'program';
    this.focusMonitor?.focusVia(element, origin, { preventScroll: preventScroll });
    // console.log('setFocus', origin, methodName, 'preventScroll:', preventScroll, element.tagName, this.value);
  }

  filterOptions(value: string) {
    const searchString = value.toLowerCase() ?? '';
    this.#options.forEach((item, index) => {
      if (searchString === '') {
        item.visible = true;
        return;
      }
      if (typeof this.search === 'function') {
        item.visible = this.search(item, searchString);
        return;
      }
      if ((this.search === 'external' && !item.custom) || !searchString) {
        // item.visible = true;
        return;
      }
      item.visible = item.label?.toLowerCase().includes(searchString) ?? true;
    });

    this.multiSelectService.updateOptionsArray(Array.from(this.#options.values()).filter((item) => item.visible));
    this.userOptionsArray$.next(Array.from(this.#options.values()).filter((item) => item.custom));
  }

  createNativeSelect() {
    if (!this.nativeId) {
      return;
    }
    this.viewContainerRef.clear();
    this.nativeSelectRef = this.viewContainerRef.createComponent(MultiSelectNativeSelectComponent);
    this.updateNativeSelect();
  }

  updateNativeSelect() {
    if (!this.nativeSelectRef || !this.nativeId) {
      return;
    }
    const options = Array.from(this.optionsSelected).map(item => {
      const { selected, value, label } = item[1];
      return { selected, value, label };
    });

    this.nativeSelectRef.instance.multiple = this.multiple;
    this.nativeSelectRef.instance.form = this.nativeFormId;
    this.nativeSelectRef.instance.id = this.nativeId;
    this.nativeSelectRef.instance.name = this.nativeName;
    this.nativeSelectRef.instance.options = [...options];
    this.nativeSelectRef.instance.disabled = this.disabled;
    this.nativeSelectRef.instance.changeDetectorRef.markForCheck();
  }

  inputElementSize() {
    if (this.inputElement) {
      if (!this.inputElement?.nativeElement?.disabled) {
        this.renderer.setAttribute(this.inputElement?.nativeElement, 'size', (this.searchValue.length + 2).toString());
      } else {
        this.renderer.removeAttribute(this.inputElement?.nativeElement, 'size');
        // this.renderer.setAttribute(this.inputElement?.nativeElement, 'size', '2');
      }
    }
  }

  handleSearchKeyDown($event: KeyboardEvent) {

    if (['Enter'].includes($event.key) && this.searchValue.length && this.allowCreateOptions) {
      $event.preventDefault();
      $event.stopPropagation();
      $event.stopImmediatePropagation();
      this.addUserOption();
      this.changeDetectorRef.markForCheck();
      return;
    }

    if (this.searchValue.length || this.optionsSelected.size === 0) {
      return;
    }

    if (['Backspace', 'Delete'].includes($event.key)) {
      $event.stopPropagation();
      const last = this.selectedOptions.filter(option => !option.disabled).pop();
      if (last) {
        this.multiSelectService.selectionModel.deselect(last.value);
      }
    }
  }

  private setFocusMonitor(monitor: boolean) {
    if (monitor && !this.disabled) {
      this.focusMonitorSubscription = this.focusMonitor?.monitor(this.elementRef, true)
        .pipe(
          // to avoid focus lost on speed scrolling with virtualScroll
          debounceTime(100),
          takeUntilDestroyed(this.#destroyRef)
        )
        .subscribe((origin) => {
          this.ngZone.run(() => {
            this.subtreeFocused = this.focusOrigin(origin);
            this.changeDetectorRef?.markForCheck();
          });
        });
    } else {
      this.focusMonitor?.stopMonitoring(this.elementRef);
      this.focusMonitorSubscription?.unsubscribe();
    }
  }

  activeOption: (FocusableOption & MultiSelectOptionComponent) | null = null;

  handleScrolledIndexChange(scrolledIndex: number, scrollViewport: CdkVirtualScrollViewport) {

    if (!this.scrollViewport) {
      this.scrollViewport = scrollViewport;
    }

    const availableOptions = this.options.filter(option => option.visible);
    const firstVisibleOption = availableOptions[scrolledIndex];
    const activeOptionIndex = availableOptions.findIndex(option => option.value === this.activeOption?.value);
    const optionsArray = this.multiSelectOptionsContent.toArray();

    if (scrolledIndex > activeOptionIndex) {
      const firstVisibleItem = optionsArray.find(option => option.value === firstVisibleOption?.value);
      if (firstVisibleItem && scrolledIndex) {
        this.focusKeyManager.setActiveItem(firstVisibleItem);
      }
      return;
    }

    if (scrolledIndex + this.visibleItems - 2 <= activeOptionIndex) {
      const lastVisibleItem = optionsArray.findIndex(option => option.value === firstVisibleOption.value);
      if (lastVisibleItem > -1) {
        this.focusKeyManager.setActiveItem(lastVisibleItem + this.visibleItems - 2);
      }
      return;
    }

  }

  trackByFn(index: number, option: IOption) {
    return option.value;
  }

  handleSearchValueChange(searchValue: string) {
    this.searchValue = searchValue;
    if (!searchValue) {
      this.scrollViewport?.scrollToIndex(0);
      this.multiSelectOptionsContent.notifyOnChanges();
      if (this.subtreeFocused) {
        this.setFocus('program', 'handleSearchValueChange');
      }
    }
  }

  private setVirtualScroller() {

    if (!this.virtualScroller) {
      return;
    }

    // multiSelectOptionTemplate for virtualScroller
    this.contentTemplates.forEach((child: TemplateIdDirective) => {
      this.templates[child.id] = child.templateRef;
    });

    // if no template found, get defaultMultiSelectOptionTemplate from view
    if (!this.templates['multiSelectOptionTemplate']) {
      this.multiSelectOptionsContent = this.multiSelectOptionsView;
      this.multiSelectOptionsContent.notifyOnChanges();
    }

    // multiSelectOptionsContent gets out of order on changes
    // do sort() and reset()
    const indexOfOption = (option: MultiSelectOptionComponent) => {
      return [...option.elementRef.nativeElement.parentElement.children]?.indexOf(option.elementRef.nativeElement);
    };

    const optionsChange$: Observable<QueryList<MultiSelectOptionComponent>> = this.multiSelectOptionsContent.changes;

    const sortedOptions$ = optionsChange$.pipe(
      map(options => options.toArray()),
      filter(options => options.length > 0),
      map(options => options.sort((a, b) => indexOfOption(a) - indexOfOption(b))),
      takeUntilDestroyed(this.#destroyRef)
    );

    sortedOptions$
      .pipe(
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(sortedOptions => {
        return this.multiSelectOptionsContent.reset(sortedOptions);
      });

    this.scrollViewportView.changes
      .pipe(
        take(1),
        map(changes => changes.toArray()[0]),
        tap((scrollViewport) => {
            if (!this.scrollViewport) {
              this.scrollViewport = scrollViewport;

              const cdkVirtualScrollContentWrapper = this.scrollViewport.getElementRef().nativeElement?.firstElementChild;
              if (cdkVirtualScrollContentWrapper) {

                const style = getComputedStyle(cdkVirtualScrollContentWrapper, null) ?? undefined;
                const padding = parseInt(style?.getPropertyValue('padding-left') ?? '12px') * 3;

                const observer = new MutationObserver((mutationRecords) => {
                  mutationRecords.forEach(child => {
                    child.addedNodes.forEach(node => {
                      if (node.nodeName === 'C-MULTI-SELECT-OPTION') {
                        const width = (node as HTMLElement).offsetWidth;
                        if (width > this.itemMinWidth) {
                          this.itemMinWidth = width + padding;
                        }
                      }
                    });
                  });
                });

                observer?.observe(cdkVirtualScrollContentWrapper, { childList: true });

                this.#destroy$.subscribe(() => {
                  observer?.disconnect();
                });
              }
            }
          }
        ),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  private setListKeyManager() {

    // run once on multiSelectOptionsContent first set
    this.multiSelectOptionsContent.changes
      .pipe(
        filter((changes) => this.virtualScroller),
        take(1),
        tap(() => {
          this.setFocusKeyManager(this.multiSelectOptionsContent);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  setFocusKeyManager(focusableOptions: (QueryList<MultiSelectOptionComponent> | MultiSelectOptionComponent[])) {

    // this.focusKeyManager?.destroy();

    this.focusKeyManager = new FocusKeyManager(focusableOptions)
      .withHomeAndEnd()
      .withPageUpDown()
      .skipPredicate((option) => (option.disabled || !option.visible));

    if (!this._virtualScroller) {
      this.focusKeyManager.withTypeAhead(300);
    }

    this.focusKeyManager.tabOut
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        tap(() => {})
      )
      .subscribe();

    this.focusKeyManager.change
      .pipe(
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe(change => {
        if (change < 0) {
          this.activeOption ? this.focusKeyManager.setActiveItem(this.activeOption) : this.setFirstItemActive();
        }
        if (this.focusKeyManager.activeItem) {
          this.focusKeyManager.activeItem.active = true;
        }
        this.activeOption = this.focusKeyManager.activeItem;
        const option = <MultiSelectOptionComponent>this.activeOption;
        this.multiSelectService.focusChange(option);
        this.multiSelectOptionsContent.notifyOnChanges();
        this.multiSelectOptionsView.notifyOnChanges();
      });

    // if (!this.focusKeyManager.activeItem) {
    //   this.setFirstItemActive();
    // }
  }

  get firstFocusableItem() {
    return this.multiSelectOptionsContent?.find(option => option.visible && !option.disabled) ?? this.multiSelectOptionsView?.find(option => option.visible && !option.disabled);
  }

  private setFirstItemActive() {
    const firstFocusableItem = this.firstFocusableItem;
    firstFocusableItem ? this.focusKeyManager?.setActiveItem(firstFocusableItem) : this.focusKeyManager?.setFirstItemActive();
    this.activeOption = this.focusKeyManager?.activeItem ?? null;
  }

  updateActiveItem(index: number): void;

  updateActiveItem<TItem extends (MultiSelectOptionComponent & FocusableOption)>(item: TItem): void;

  updateActiveItem(item: any) {
    const firstFocusableItem = this.firstFocusableItem ?? item;
    firstFocusableItem ? this.focusKeyManager?.updateActiveItem(firstFocusableItem) : this.focusKeyManager?.updateActiveItem(0);
    if (this.focusKeyManager?.activeItem) {
      this.multiSelectOptionsContent?.forEach(option => {
        option.active = false;
      });
      this.multiSelectOptionsView?.forEach(option => {
        option.active = false;
      });
      this.focusKeyManager.activeItem.active = true;
    }
    this.activeOption = this.focusKeyManager?.activeItem ?? null;
  }
}
