import { AfterViewInit, DestroyRef, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, debounceTime, distinctUntilChanged, fromEvent, map, Subscription } from 'rxjs';
import { IColumn } from '../smart-table.type';

@Directive({
  selector: '[cFilterInput]',
  exportAs: 'cFilterInput',
  standalone: true
})
export class FilterInputDirective implements AfterViewInit {

  constructor(
    private readonly elementRef: ElementRef,
    private readonly destroyRef: DestroyRef
  ) { }

  #value = '';
  #valueSubscription!: Subscription;
  #inputSubscription!: Subscription;
  readonly value$ = new BehaviorSubject<string>('');
  public emitObject: { value: string, type?: string, column?: (string | IColumn) } = {
    value: '',
    type: '',
    column: ''
  };

  @Input() delay: number = 300;
  @Input() onEvent: 'change' | 'input' = 'input';

  @Input()
  set value(value: string) {
    this.value$.next(value);
  }

  @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

  ngAfterViewInit(): void {
    this.setSubscription();
  }

  private setSubscription() {

    this.#valueSubscription = this.value$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        if (this.#value !== value) {
          this.#value = value;
          this.emitObject = { ...this.emitObject, value: value, type: this.onEvent };
          this.valueChange.emit({ ...this.emitObject });
        }
      });

    const dueTime = this.onEvent === 'change' ? 0 : this.delay;

    this.#inputSubscription = fromEvent<Event>(this.elementRef.nativeElement, this.onEvent)
      .pipe(
        map(event => {
          return (event.target as HTMLInputElement).value;
        }),
        debounceTime(dueTime),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        if (value !== this.#value) {
          this.value$.next(value);
        }
      });
  }
}
