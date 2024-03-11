import { NgModule } from '@angular/core';

import { MultiSelectService } from './multi-select.service';
import { MultiSelectComponent } from './multi-select/multi-select.component';
import { MultiSelectOptionComponent } from './multi-select-option/multi-select-option.component';
import { MultiSelectOptgroupComponent } from './multi-select-optgroup/multi-select-optgroup.component';
import { MultiSelectOptgroupLabelComponent } from './multi-select-optgroup/multi-select-optgroup-label.component';

@NgModule({
  imports: [
    MultiSelectComponent,
    MultiSelectOptionComponent,
    MultiSelectOptgroupComponent,
    MultiSelectOptgroupLabelComponent
  ],
  exports: [
    MultiSelectComponent,
    MultiSelectOptionComponent,
    MultiSelectOptgroupComponent,
    MultiSelectOptgroupLabelComponent
  ],
  providers: [MultiSelectService]
})
export class MultiSelectModule {
}
