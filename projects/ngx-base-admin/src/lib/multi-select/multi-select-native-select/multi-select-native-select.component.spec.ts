import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectNativeSelectComponent } from './multi-select-native-select.component';

describe('MultiSelectNativeSelectComponent', () => {
  let component: MultiSelectNativeSelectComponent;
  let fixture: ComponentFixture<MultiSelectNativeSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectNativeSelectComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectNativeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
