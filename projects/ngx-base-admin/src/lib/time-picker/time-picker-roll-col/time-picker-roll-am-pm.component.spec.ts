import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimePickerRollAmPmComponent } from './time-picker-roll-am-pm.component';

describe('TimePickerRollAmPmComponent', () => {
  let component: TimePickerRollAmPmComponent;
  let fixture: ComponentFixture<TimePickerRollAmPmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimePickerRollAmPmComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TimePickerRollAmPmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
