import { computed, Injectable, signal } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, Subject } from 'rxjs';
import { MultiSelectOptionComponent } from './multi-select-option/multi-select-option.component';
import { IOption } from './multi-select.type';

@Injectable()
export class MultiSelectService {

  public optionsStyle: 'checkbox' | 'text' = 'checkbox';

  selectionModel!: SelectionModel<any>;

  setSelectionModel(multiple = true, initiallySelectedValues: string[] = []) {
    this.selectionModel = new SelectionModel<any>(multiple);
  }

  private readonly multiSelectVisible = new BehaviorSubject<boolean>(false);
  readonly multiSelectVisible$ = this.multiSelectVisible.asObservable();

  toggleVisible(visible: boolean): void {
    this.multiSelectVisible.next(visible);
  }

  private readonly multiSelectFocus = new Subject<MultiSelectOptionComponent>();
  readonly multiSelectFocus$ = this.multiSelectFocus.asObservable();

  focusChange(option: MultiSelectOptionComponent) {
    this.multiSelectFocus.next(option);
  }

  public readonly userOptionsSignal = signal<IOption[]>([]);

  getUserOptions() {
    return computed(this.userOptionsSignal);
  }

  addUserOption(option: IOption) {
    this.userOptionsSignal.update((options) => [...options, option]);
  }

  removeUserOption(value: string) {
    const updatedOptions = this.userOptionsSignal().filter((option) => option.value !== value);
    this.userOptionsSignal.set(updatedOptions);
  }

  removeAllUserOptions() {
    this.userOptionsSignal.set([]);
  }

  private readonly optionsArray = new BehaviorSubject<IOption[]>([]);
  readonly optionsArray$ = this.optionsArray.asObservable();

  getOptionsArray() {
    return this.optionsArray$;
  }

  updateOptionsArray(options: IOption[]) {
    this.optionsArray.next(options);
  }

}

