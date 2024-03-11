import { Pipe, PipeTransform } from '@angular/core';
import { IColumn } from '../smart-table.type';

@Pipe({
  name: 'columnLabel',
  standalone: true
})
export class SmartTableColumnLabelPipe implements PipeTransform {

  transform(column: IColumn | string, ...args: unknown[]): unknown {
    return typeof column === 'object' ? column?.label !== undefined ? column.label : this.prettifyName(column.key) : this.prettifyName(column);
  }

  prettifyName(name: string) {
    return name
      .replace(/[-_.]/g, ' ')
      .replace(/ +/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

}
