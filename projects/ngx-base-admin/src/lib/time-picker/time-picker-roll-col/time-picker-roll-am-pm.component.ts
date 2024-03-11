import {
  AfterViewInit,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DayPeriod } from '../time.utils';

export interface IDayPeriod {
  value: string;
  label: string;
  dayPeriod?: DayPeriod;
  disabled?: boolean;
}

@Directive({
  selector: '[cDayPeriodElement]',
  exportAs: 'cDayPeriodElement',
  standalone: true
})
export class DayPeriodElementDirective {

  constructor(
    public elementRef: ElementRef
  ) { }

  @Input() cDayPeriodElement!: IDayPeriod;
}

@Component({
  selector: 'c-time-picker-roll-am-pm',
  templateUrl: './time-picker-roll-am-pm.component.html',
  styleUrls: ['./time-picker-roll-am-pm.component.scss'],
  standalone: true,
  imports: [CommonModule, DayPeriodElementDirective]
})
export class TimePickerRollAmPmComponent implements OnChanges, AfterViewInit {

  constructor(
    public elementRef: ElementRef
  ) { }

  private init = true;

  @Input() disabled = false;
  @Input() elements: IDayPeriod[] = [];
  @Input() onClick?: (value: number | string) => void;
  @Input() selected?: number | string | null;
  @Input() refresh?: boolean;

  @Output() selectedChange: EventEmitter<any> = new EventEmitter<any>();

  @HostBinding('class')
  get hostClasses() {
    return {
      'time-picker-roll-col': true,
      disabled: this.disabled
    };
  }

  @ViewChildren(DayPeriodElementDirective) dayPeriodElements!: QueryList<DayPeriodElementDirective>;

  ngAfterViewInit(): void {
    this.dayPeriodElements?.changes.subscribe(state => {
      const selectedElement = this.dayPeriodElements?.find(element => {
        return element.cDayPeriodElement?.value === <string>this.selected;
      });
      this.scrollToElement(selectedElement?.elementRef.nativeElement);
    });
    const selectedElement = this.elementRef.nativeElement.querySelector('.selected');
    this.scrollToElement(selectedElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['refresh'] && changes['refresh'].currentValue) || (changes['selected'] && !changes['selected'].firstChange)) {
      // @ts-ignore
      const selectedElement = this.dayPeriodElements?.find(element => {
        return element.cDayPeriodElement?.value === <string>this.selected;
      });
      this.init = !selectedElement;
      this.scrollToElement(selectedElement?.elementRef.nativeElement);
    }
  }

  scrollToElement(element: any) {
    setTimeout(() => {
      const elementSelected = element || this.elementRef.nativeElement.querySelector('.selected');
      if (elementSelected) {
        this.elementRef.nativeElement.scrollTo({
          top: elementSelected?.offsetTop,
          behavior: this.init ? 'auto' : 'smooth'
        });
        this.init = false;
      }
    });
  }

  handleElementClick($event: MouseEvent, element: any) {
    if (element.disabled) {
      return;
    }
    this.selected = element.value;
    this.scrollToElement($event.target);
    this.onClick && this.onClick(element.value);
    this.selectedChange.emit(element.value);
  }

  trackByElement(index: number, element: IDayPeriod) {
    return element.value;
  }

}
