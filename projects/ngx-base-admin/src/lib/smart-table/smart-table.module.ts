import { NgModule } from '@angular/core';
import { SmartTableComponent } from './smart-table/smart-table.component';
import { SmartTableFilterComponent } from './smart-table-filter/smart-table-filter.component';

@NgModule({
  exports: [SmartTableComponent, SmartTableFilterComponent],
  imports: [SmartTableComponent, SmartTableFilterComponent]
})
export class SmartTableModule {
}
