import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'c-multi-select-native-select',
  templateUrl: './multi-select-native-select.component.html',
  styleUrls: ['./multi-select-native-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgForOf]
})
export class MultiSelectNativeSelectComponent {

  @Input() form?: string = '';
  @Input() id?: string = '';
  @Input() multiple?: boolean;
  @Input() name?: string;
  @Input() options?: any;
  @Input() disabled?: boolean;

  constructor(
    public changeDetectorRef: ChangeDetectorRef
  ) { }
}
