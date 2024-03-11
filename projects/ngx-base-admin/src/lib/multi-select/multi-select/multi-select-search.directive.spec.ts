import { MultiSelectSearchDirective } from './multi-select-search.directive';
import { DestroyRef, ElementRef } from '@angular/core';

describe('MultiSelectSearchDirective', () => {

  let hostElement: ElementRef;
  let destroyRef: DestroyRef;

  it('should create an instance', () => {
    const directive = new MultiSelectSearchDirective(hostElement, destroyRef);
    expect(directive).toBeTruthy();
  });
});
