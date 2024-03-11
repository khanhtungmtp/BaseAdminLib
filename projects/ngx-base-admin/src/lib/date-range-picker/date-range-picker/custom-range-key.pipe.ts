import { Pipe, PipeTransform } from '@angular/core';
import { TCustomRange } from './date-range-picker.component';

@Pipe({
  name: 'customRangeKey',
  standalone: true
})
export class CustomRangeKeyPipe implements PipeTransform {

  transform(customRange: TCustomRange, ...args: unknown[]): unknown {
    return customRange[0];
  }

}
