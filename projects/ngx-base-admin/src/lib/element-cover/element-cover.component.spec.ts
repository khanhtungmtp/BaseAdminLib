import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementCoverComponent } from './element-cover.component';

describe('ElementCoverComponent', () => {
  let component: ElementCoverComponent;
  let fixture: ComponentFixture<ElementCoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElementCoverComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
