import { AfterViewInit, DestroyRef, Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Directive({
  selector: '[cMultiSelectSearch]',
  exportAs: 'cMultiSelectSearch',
  standalone: true
})
export class MultiSelectSearchDirective implements AfterViewInit {

  constructor(
    private readonly elementRef: ElementRef,
    private readonly destroyRef: DestroyRef
  ) { }

  readonly #value$ = new BehaviorSubject<string>('');
  #input$!: Observable<string>;
  #value = '';

  @Input() delay: number = 300;

  @Input()
  set value(value: string) {
    this.#value$.next(value);
  }

  @Output() readonly valueChange: EventEmitter<string> = new EventEmitter<string>();

  ngAfterViewInit(): void {
    this.setSubscription();
  }

  private setSubscription() {

    this.#value$
      .pipe(
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
        // debounceTime(this.delay),
        // switchMap(value => this.#input$)
      )
      .subscribe(value => {
        if (this.#value !== value) {
          this.#value = value;
          this.valueChange.emit(value);
        }
      });

    this.#input$ = fromEvent<Event>(this.elementRef.nativeElement, 'input')
      .pipe(
        debounceTime(this.delay),
        map(event => {
          return (event.target as HTMLInputElement).value;
        }),
        takeUntilDestroyed(this.destroyRef)
      );

    this.#input$
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        if (value !== this.#value) {
          this.#value$.next(value);
        }
      });
  }
}
