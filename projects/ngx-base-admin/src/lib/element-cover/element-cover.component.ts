import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, Input, ViewChild } from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';

import { SpinnerComponent } from '../spinner';

@Component({
  selector: 'c-element-cover, [cElementCover]',
  templateUrl: './element-cover.component.html',
  styleUrls: ['./element-cover.component.scss'],
  imports: [SpinnerComponent, NgStyle, NgIf],
  standalone: true
})
export class ElementCoverComponent implements AfterViewInit {

  constructor(private elementRef: ElementRef, private changeDetectorRef: ChangeDetectorRef) {}

  /**
   * Array of custom boundaries. Use to create custom cover area (instead of parent element area). Area is defined by four sides: 'top', 'bottom', 'right', 'left'. If side is not defined by any custom boundary it is equal to parent element boundary. Each custom boundary is object with keys:
   * - sides (array) - select boundaries of element to define boundaries. Side names: 'top', 'bottom', 'right', 'left'.
   * - query (string) - query used to get element which define boundaries. Search will be done only inside parent element, by parent.querySelector(query) function. [docs]
   * @type {sides: string[], query: string}[]
   */
  @Input() boundaries?: { sides: string[]; query: string }[];
  @Input() opacity: number = 0.4;

  @ViewChild('content') content?: ElementRef;
  hasContent = true;
  #parent!: any;

  private get customBoundaries() {
    if (!this.boundaries || this.elementRef === null) {
      return {};
    }
    if (!this.#parent) {
      return {};
    }
    const parentCoords = this.#parent?.getBoundingClientRect();
    const _customBoundaries = {};
    this.boundaries.forEach((value: any) => {
      const element = this.#parent?.querySelector(value.query);
      if (!element || !value.sides) {
        return;
      }
      const coords = element.getBoundingClientRect();
      value.sides.forEach((side: string) => {
        const sideMargin = Math.abs(coords[side] - parentCoords[side]);
        // @ts-ignore
        _customBoundaries[side] = `${sideMargin}px`;
      });
    });
    return _customBoundaries;
  }

  private get containerCoords() {
    return {
      top: 0, left: 0, right: 0, bottom: 0, ...this.customBoundaries
    };
  }

  @HostBinding('style')
  private get coverStyles() {
    return {
      ...this.containerCoords, position: 'absolute', backgroundColor: `rgb(255,255,255,${this.opacity})`
    };
  }

  ngAfterViewInit(): void {
    this.#parent = this.elementRef.nativeElement.parentElement;
    this.hasContent = this.content?.nativeElement.childNodes.length ?? false;
    this.changeDetectorRef.detectChanges();
  }
}
