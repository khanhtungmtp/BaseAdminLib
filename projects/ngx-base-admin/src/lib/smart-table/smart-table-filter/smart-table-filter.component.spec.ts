import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterInputDirective } from './filter-input.directive';
import { SmartTableFilterComponent } from './smart-table-filter.component';

describe('SmartTableFilterComponent', () => {
  let component: SmartTableFilterComponent;
  let fixture: ComponentFixture<SmartTableFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartTableFilterComponent],
      providers: [FilterInputDirective]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartTableFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
