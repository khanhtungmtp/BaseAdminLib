import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectOptgroupComponent } from './multi-select-optgroup.component';
import { MultiSelectService } from '../multi-select.service';

describe('MultiSelectOptgroupComponent', () => {
  let component: MultiSelectOptgroupComponent;
  let fixture: ComponentFixture<MultiSelectOptgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectOptgroupComponent],
      providers: [MultiSelectService]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectOptgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
