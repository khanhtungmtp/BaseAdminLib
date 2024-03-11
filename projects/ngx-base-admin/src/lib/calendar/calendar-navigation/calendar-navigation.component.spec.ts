import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarNavigationComponent } from './calendar-navigation.component';
import { CalendarService } from '../calendar.service';

describe('CalendarNavigationComponent', () => {
  let component: CalendarNavigationComponent;
  let fixture: ComponentFixture<CalendarNavigationComponent>;
  let date = new Date();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarNavigationComponent],
      providers: [CalendarService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarNavigationComponent);
    component = fixture.componentInstance;
    component.calendarDate = date;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
