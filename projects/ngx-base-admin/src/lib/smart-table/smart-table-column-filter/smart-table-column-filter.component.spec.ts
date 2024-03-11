import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterInputDirective } from '../smart-table-filter/filter-input.directive';
import { SmartTableColumnFilterComponent } from './smart-table-column-filter.component';

describe('SmartTableColumnFilterComponent', () => {
  let component: SmartTableColumnFilterComponent;
  let fixture: ComponentFixture<SmartTableColumnFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartTableColumnFilterComponent],
      providers: [FilterInputDirective]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SmartTableColumnFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
