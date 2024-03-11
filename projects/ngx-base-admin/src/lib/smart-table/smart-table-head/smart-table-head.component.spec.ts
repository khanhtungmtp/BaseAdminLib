import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartTableHeadComponent } from './smart-table-head.component';

describe('SmartTableHeadComponent', () => {
  let component: SmartTableHeadComponent;
  let fixture: ComponentFixture<SmartTableHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ SmartTableHeadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartTableHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
