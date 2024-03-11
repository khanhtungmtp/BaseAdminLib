import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  selector: 'c-multi-select-optgroup-label',
  template: '<ng-content></ng-content>',
  styleUrls: ['./multi-select-optgroup-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class MultiSelectOptgroupLabelComponent {

  constructor() { }

  @HostBinding('class') get hostClasses() {
    return {
      'form-multi-select-optgroup-label': true
    };
  }
}
