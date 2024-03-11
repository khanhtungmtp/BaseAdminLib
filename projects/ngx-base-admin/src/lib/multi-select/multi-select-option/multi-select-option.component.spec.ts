import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectOptionComponent } from './multi-select-option.component';
import { MultiSelectService } from '../multi-select.service';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [MultiSelectOptionComponent],
  template: `<c-multi-select-option value="value" label="label"></c-multi-select-option>`,
})
class TestHostComponent {
}

describe('MultiSelectOptionComponent', () => {
  let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let service: MultiSelectService;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectOptionComponent, TestHostComponent],
      providers: [MultiSelectService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    service = TestBed.inject(MultiSelectService);
    service.setSelectionModel(true)
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(testHost).toBeDefined();
  });
});
