import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartTableItemsPerPageSelectorComponent } from './smart-table-items-per-page-selector.component';

describe('SmartTableItemsPerPageSelectorComponent', () => {
  let component: SmartTableItemsPerPageSelectorComponent;
  let fixture: ComponentFixture<SmartTableItemsPerPageSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartTableItemsPerPageSelectorComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartTableItemsPerPageSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
