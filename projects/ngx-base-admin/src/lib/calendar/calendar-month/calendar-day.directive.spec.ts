import { Component, DebugElement } from '@angular/core';
import { CalendarDayDirective } from './calendar-day.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarService } from '../calendar.service';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <div #td [cCalendarDay]="dateObj"></div>`
})
class TestComponent {
  public dateObj = {
    date: new Date(),
    month: 'current'
  };
}

describe('CalendarDayDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let des: DebugElement;
  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [CalendarDayDirective],
      providers: [CalendarService]
    })
      .createComponent(TestComponent);

    fixture.detectChanges(); // initial binding
    des = fixture.debugElement.query(By.directive(CalendarDayDirective));
  });

  it('should create an instance', () => {
    expect(des).toBeTruthy();
  });
});
