import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmartPaginationComponent } from './smart-pagination.component';

describe('SmartPaginationComponent', () => {
  let component: SmartPaginationComponent;
  let fixture: ComponentFixture<SmartPaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmartPaginationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
