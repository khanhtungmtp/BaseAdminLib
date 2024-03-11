import {
  AfterViewInit,
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  NgZone,
  Output,
  signal,
  ViewChild,
  ViewRef,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FocusableOption, FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { distinctUntilChanged, filter, tap } from 'rxjs/operators';

import { MultiSelectService } from '../multi-select.service';

@Component({
  selector: 'c-multi-select-option',
  templateUrl: './multi-select-option.component.html',
  styleUrls: ['./multi-select-option.component.scss'],
  exportAs: 'cMultiSelectOption',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class MultiSelectOptionComponent implements AfterViewInit, FocusableOption {

  readonly #destroyRef = inject(DestroyRef);
  readonly #ngZone = inject(NgZone);

  constructor(
    public readonly elementRef: ElementRef,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly focusMonitor: FocusMonitor,
    private readonly multiSelectService: MultiSelectService
  ) {}

  /**
   * Option style
   * @type ('checkbox' | 'text')
   * @default 'checkbox'
   */
  @Input() optionsStyle: ('checkbox' | 'text') = this.multiSelectService.optionsStyle ?? 'checkbox';

  /**
   * Option label
   * @type string
   * @default undefined
   */
  @Input() label?: string;

  /**
   * Option inner text
   * @type string
   * @default undefined
   */
  @Input() text?: string;

  /**
   * Option visible.
   * @type boolean
   * @default true
   */
  @Input({ transform: booleanAttribute })
  set visible(value: boolean) {
    this.#visible.set(value);
  }

  get visible() {
    return this.#visible();
  }

  #visible = signal(true);

  /**
   * Option disabled.
   * @type boolean
   * @default false
   */
  @Input({ transform: booleanAttribute }) disabled: boolean = false;

  /**
   * Option selected.
   * @type boolean
   * @default false
   */
  @Input()
  set selected(value: (boolean | undefined)) {
    if (value !== undefined) {
      const selected = booleanAttribute(value);
      if (this.#selected() !== selected) {
        this.#selected.set(selected);
        if (this.value !== undefined) {
          selected ? this.multiSelectService.selectionModel?.select(this.value) : this.multiSelectService.selectionModel?.deselect(this.value);
        }
      }
    }
  }

  get selected() {
    return this.#selected();
  }

  #selected = signal<boolean | undefined>(undefined);

  /**
   * Emits option selected change
   * @type boolean
   */
  @Output() readonly selectedChange = new EventEmitter<boolean>();

  /**
   * Option value.
   * @type string | number
   * @default undefined
   */
  @Input()
  set value(value: string | number) {
    if (this.#value() !== value) {
      this.#value.set(value);
    }
  }

  get value() {
    return this.#value();
  }

  #value: WritableSignal<any> = signal(undefined);

  @ViewChild('contentDiv') private contentDiv?: ElementRef;
  public hasContent = signal(true);

  #dropdownVisible = signal(false);

  @Input({ transform: booleanAttribute })
  set active(value: (boolean)) {
    const active = value && this.#visible() && !this.disabled;
    if (this.#active() !== active) {
      this.#active.set(active);
    }
  }

  get active() {
    return this.#active() && this.#visible();
  }

  #active = signal(false);

  #focused = false;

  @Output() readonly focusChange = new EventEmitter<MultiSelectOptionComponent>();

  @Input()
  @HostBinding('role')
  private get role() {
    return 'option';
  }

  @HostBinding('class')
  get hostClasses() {
    return {
      'form-multi-select-option': true,
      'form-multi-selected': this.#selected(),
      [`form-multi-select-option-with-${this.optionsStyle}`]: !!this.optionsStyle,
      disabled: this.disabled,
      'd-none': !this.#visible(),
      active: this.#active(),
      focused: this.#focused
    };
  }

  @HostBinding('attr.tabindex')
  private get tabIndex() {
    return (this.disabled || !this.#visible()) ? -1 : this.#tabIndex();
  }

  #tabIndex = computed(() => {
    return (this.#active() && this.#visible() ? 0 : -1);
  });

  @HostBinding('attr.disabled')
  @HostBinding('attr.aria-disabled')
  private get ariaDisabled() {
    return this.disabled || null;
  }

  @HostBinding('attr.aria-selected')
  private get ariaSelected() {
    return this.#ariaSelected() ?? false;
  }

  #ariaSelected = computed(() => {
    const value = this.#value();
    const selected = this.#selected();
    if ((value !== undefined) && (selected !== undefined)) {
      selected ? this.multiSelectService.selectionModel?.select(value) : this.multiSelectService.selectionModel?.deselect(value);
      this.selectedChange.emit(selected);
      this.changeDetectorRef.markForCheck();
    }
    return selected;
  });

  @HostListener('keydown', ['$event'])
  onKeyDown($event: KeyboardEvent): void {
    if (['Space'].includes($event.code)) {
      $event.preventDefault();
    }
    if (['Tab'].includes($event.code)) {
      $event.preventDefault();
    }
  }

  @HostListener('blur')
  private onBlur() {
    this.#focused = false;
  }

  @HostListener('focus')
  private onFocus() {
    this.#focused = true;
  }

  @HostListener('keyup', ['$event'])
  private onKeyUp($event: KeyboardEvent): void {
    if (this.#dropdownVisible()) {
      if (['Enter', 'Space'].includes($event.code)) {
        $event.stopImmediatePropagation();
        $event.preventDefault();
        this.selected = this.disabled ? this.#selected() : !this.#selected();
        this.focus('keyboard');
      }
    }
  }

  @HostListener('click', ['$event'])
  private onClick($event: MouseEvent): void {
    $event.stopPropagation();
    this.selected = this.disabled ? this.#selected() : !this.#selected();
    this.focus('mouse');
  }

  ngAfterViewInit(): void {

    this.setSubscriptions();

    const hasContent = !!this.contentDiv?.nativeElement.childNodes.length;
    if (!hasContent) {
      this.#ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.hasContent.set(hasContent);
          // this.#ngZone.run(() => {
          //   this.changeDetectorRef.markForCheck();
          // });
        });
      });
    }

    if (this.text === undefined) {
      const innerText = this.elementRef.nativeElement.textContent.trim() || this.elementRef.nativeElement.innerText.trim();
      this.text = innerText || this.value?.toString().trim();
    }

    if (this.label === undefined) {
      this.label = this.text?.trim();
    }

    if (this.value === undefined) {
      this.value = this.label?.trim() || '...';
    }

    if (!(this.changeDetectorRef as ViewRef).destroyed) {
      // setTimeout(() => {
      this.selected = this.isSelected(this.value);
      this.changeDetectorRef.markForCheck();
      // });
    }

  }

  /** Get the label for this element which is required by the FocusableOption interface. */
  getLabel(): string {
    return <string>(this.label ?? this.value);
  }

  focus(origin: FocusOrigin = 'program'): void {
    if (this.#dropdownVisible() && !this.disabled) {
      this.focusMonitor.focusVia(this.elementRef.nativeElement, origin, { preventScroll: false });
      this.multiSelectService.focusChange(this);
      this.changeDetectorRef.markForCheck();
      this.focusChange.emit(this);
    }
  }

  private setSubscriptions() {

    this.multiSelectService.multiSelectVisible$
      .pipe(
        tap(visible => {
            this.#dropdownVisible.set(visible);
          }
        ),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();

    this.multiSelectService.multiSelectFocus$
      .pipe(
        distinctUntilChanged(),
        filter(option => this.active !== (this.value === option.value)),
        tap(option => {
          this.active = this.value === option.value;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();

    if (!(this.changeDetectorRef as ViewRef).destroyed) {
      this.multiSelectService.selectionModel.changed
        .pipe(
          filter(change => change.added.includes(this.value) || change.removed.includes(this.value)),
          tap(change => {
            this.selected = change.added.includes(this.value);
            this.changeDetectorRef.markForCheck();
          }),
          takeUntilDestroyed(this.#destroyRef)
        )
        .subscribe();
    }
  }

  isSelected(value = this.value): boolean {
    return (this.#selected() || this.multiSelectService.selectionModel?.isSelected(value)) ?? false;
  }
}
