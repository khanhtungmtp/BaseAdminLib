import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimePickerRollColComponent } from './time-picker-roll-col.component';

describe('TimePickerRollColComponent', () => {
  let component: TimePickerRollColComponent;
  let fixture: ComponentFixture<TimePickerRollColComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimePickerRollColComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TimePickerRollColComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
