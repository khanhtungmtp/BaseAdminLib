import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSelectTagComponent } from './multi-select-tag.component';
import { MultiSelectService } from '../multi-select.service';

describe('MultiSelectTagComponent', () => {
  let component: MultiSelectTagComponent;
  let fixture: ComponentFixture<MultiSelectTagComponent>;
  let service: MultiSelectService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [MultiSelectService],
      imports: [MultiSelectTagComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectTagComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(MultiSelectService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
