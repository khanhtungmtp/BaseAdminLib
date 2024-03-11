import { FilterInputDirective } from './filter-input.directive';
import { DestroyRef, ElementRef } from '@angular/core';

let elementRef: ElementRef;
let destroyRef: DestroyRef;

describe('FilterInputDirective', () => {
  it('should create an instance', () => {
    const directive = new FilterInputDirective(elementRef, destroyRef);
    expect(directive).toBeTruthy();
  });
});
