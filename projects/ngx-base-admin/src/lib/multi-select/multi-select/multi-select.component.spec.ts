import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiSelectComponent } from './multi-select.component';
import { MultiSelectService } from '../multi-select.service';

describe('MultiSelectComponent', () => {
  let component: MultiSelectComponent<string|number>;
  let fixture: ComponentFixture<MultiSelectComponent<string|number>>;
  let service: MultiSelectService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [MultiSelectService],
      imports: [MultiSelectComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(MultiSelectService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
