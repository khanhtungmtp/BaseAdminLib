import { Colors } from '../coreui.types';
import { TemplateRef } from '@angular/core';
import { ITable, ITableElementProps, ITableRowCellProps } from '../table/table.type';

export interface ISmartTable {
  /**
   * Sets active page. If 'pagination' prop is enabled, activePage is set only initially.
   * @type number
   * @default 1
   */
  activePage?: number;
  /**
   * When set, displays table cleaner above table, next to the table filter (or in place of table filter if `tableFilter` prop is not set)
   * Cleaner resets `tableFilterValue`, `columnFilterValue`, `sorterValue`.
   * If clean is possible it is clickable (`tabIndex="0"` `role="button"`, `color="danger"`), otherwise it is not clickable and transparent.
   * Cleaner can be customized through the `cleaner` slot.
   * @type boolean
   */
  cleaner?: boolean;
  /**
   * Style table items as clickable.
   * @type boolean
   */
  clickableRows?: boolean;
  /**
   * When set, displays additional filter row between table header and items, allowing filtering by specific column.
   * Column filter can be customized, by passing prop as object with additional options as keys. Available options:
   * - external (Boolean) - Disables automatic filtering inside component.
   * - lazy (Boolean) - Set to true to trigger filter updates only on change event.
   * @type boolean | ColumnFilter
   */
  columnFilter?: boolean | IColumnFilter;
  /**
   * Value of table filter. To set pass object where keys are column names and values are filter strings e.g.:
   * { user: 'John', age: 12 }
   */
  columnFilterValue?: IColumnFilterValue;
  /**
   * Prop for table columns configuration. If prop is not defined, table will display columns based on the first item keys, omitting keys that begin with underscore (e.g. '_classes')
   *
   * In columns prop each array item represents one column. Item might be specified in two ways:
   * String: each item define column name equal to item value.
   * Object: item is object with following keys available as column configuration:
   * - key (required)(String) - define column name equal to item key.
   * - label (String) - define visible label of column. If not defined, label will be generated automatically based on column name, by converting kebab-case and snake_case to individual words and capitalization of each word.
   * - _classes (String/Array/Object) - adds classes to all cels in column
   * - _style (String/Array/Object) - adds styles to the column header (useful for defining widths)
   * - sorter (Boolean) - disables sorting of the column when set to false
   * - filter (Boolean) - removes filter from column when set to false.
   */
  columns?: (string | IColumn)[];
  /**
   * Enables table sorting by column value. Sorting will be performed correctly if values in column are one of type: string (case-insensitive) or number.
   *
   * Sorter can be customized, by passing prop as object with additional options as keys. Available options:
   * - external (Boolean) - Disables automatic sorting inside component.
   * - resetable (Boolean) - If set to true clicking on sorter have three states: ascending, descending and null. That means that third click on sorter will reset sorting, and restore table to original order.
   * @type boolean | Sorter
   */
  columnSorter?: boolean | ISorter;
  /**
   * Displays table footer, which mirrors table header. (without column filter).
   * @default false
   * @type boolean
   */
  footer?: boolean;
  /**
   * Set to false to remove table header.
   * @default true
   */
  header?: boolean;
  /**
   * Array of objects, where each object represents one item - row in table. Additionally, you can add style classes to each row by passing them by '_classes' key and to single cell by '_cellClasses'.
   *
   * Example item:
   * { name: 'John' , age: 12, _props: { color: 'success' }, _cellProps: { age: { className: 'fw-bold'}}}
   * For column generation description see columns prop.
   * @type Array<IItem>
   */
  items?: IItem[];
  /**
   * Number of items per site, when pagination is enabled.
   * @default 10
   * @type number
   */
  itemsPerPage?: number;
  /**
   * Label for items per page selector.
   * @default 'Items per page:'
   * @type string
   * todo or remove?
   */
  itemsPerPageLabel?: string;
  /**
   * Items per page selector options.
   * @default [5, 10, 20, 50]
   * @type number[]
   * todo or remove?
   */
  itemsPerPageOptions?: number[];
  /**
   * Adds select element over table, which is used for control items per page in pagination.
   * If you want to customize this element, pass an object with optional values:
   * - label (String) - replaces default label text
   * - values (Array) - custom array of pagination values
   * - external (Boolean) - disables automatic 'itemsPerPage' change (use to change pages externally by 'pagination-change' event).
   */
  itemsPerPageSelect?: boolean | ItemsPerPageSelect;
  /**
   * When set, table will have loading style: loading spinner and reduced opacity.
   * When 'small' prop is enabled spinner will be also smaller.
   * @type boolean
   */
  loading?: boolean;
  /**
   * ReactNode or string for passing custom noItemsLabel texts.
   * @default 'No items found'
   */
  noItemsLabel?: string | TemplateRef<any>;
  /**
   * Enables default pagination. Set to true for default setup or pass an object with additional CPagination props.
   * Default pagination will always have the computed number of pages that cannot be changed.
   * The number of pages is generated based on the number of passed items and 'itemsPerPage' prop.
   * If this restriction is an obstacle, you can make external CPagination instead.
   */
  pagination?: boolean;
  /**
   * Properties to `CSmartPagination` component.
   * @link https://coreui.io/angular/docs/components/smart-pagination#csmartpagination
   * todo or remove?
   */
  // paginationProps?: CSmartPaginationProps
  /**
   * Scoped columns.
   * @type ScopedColumns
   * todo or remove?
   */
  // scopedColumns?: ScopedColumns
  /**
   * Add checkboxes to make table rows selectable.
   * @type boolean
   */
  selectable?: boolean;
  /**
   * Enables select all checkbox displayed in the header of the table.
   * @type boolean
   */
  selectAll?: boolean;
  /**
   * State of the sorter. Name key is column name, direction can be 'asc' or 'desc'.
   * @type ISorterValue
   */
  sorterValue?: ISorterValue;
  /**
   * Sorter icon when items are unsorted.
   * @default '<svg cIcon width="18" content={cilArrowTop} />
   */
  sortingIcon?: TemplateRef<any>;
  /**
   * Sorter icon when items are sorted ascending.
   * @default '<svg cIcon width="18" content={cilArrowTop} />
   */
  sortingIconAscending?: TemplateRef<any>;
  /**
   * Sorter icon when items are sorted descending.
   * @default '<svg cIcon width="18" content={cilArrowBottom} />
   */
  sortingIconDescending?: TemplateRef<any>;
  /**
   * Properties to `CTableBody` component.
   * @link https://coreui.io/angular/docs/components/table/#ctablebody
   * todo or remove?
   */
  // tableBodyProps?: CTableBodyProps
  /**
   * Properties to `CTableFoot` component.
   * @link https://coreui.io/angular/docs/components/table/#ctablefoot
   * todo or remove?
   */
  //   tableFootProps?: CTableFootProps
  /**
   * When set, displays table filter above table, allowing filtering by specific column.
   *
   * Column filter can be customized, by passing prop as object with additional options as keys. Available options:
   * - placeholder (String) - Sets custom table filter placeholder.
   * - label (String) - Sets custom table filter label.
   * - external (Boolean) - Disables automatic filtering inside component.
   * - lazy (Boolean) - Set to true to trigger filter updates only on change event.
   */
  tableFilter?: boolean | ITableFilter;
  /**
   * The element represents a caption for a component.
   * @default 'Filter:'
   * todo or remove?
   */
  tableFilterLabel?: string;
  /**
   * Specifies a short hint that is visible in the search input.
   * @default 'type string...'
   * todo or remove?
   */
  tableFilterPlaceholder?: string;
  /**
   * Value of table filter. Set .sync modifier to track changes.
   * @type string
   */
  tableFilterValue?: string;
  /**
   * Properties to `CTableHead` component.
   * @link https://coreui.io/angular/docs/components/table/#ctablehead
   * todo or remove?
   */
  // tableHeadProps?: CTableHeadProps
  /**
   * Properties to `CTable` component.
   * @link https://coreui.io/angular/docs/components/table/#ctable
   */
  tableProps?: ITable;
}

export interface IColumnFilter {
  lazy?: boolean;
  external?: boolean;
}

export interface IColumnFilterValue {
  [key: string]: any;
}

export interface IColumn {
  filter?: boolean | ((column: IItem, value: string) => boolean);
  label?: string;
  key: string;
  sorter?: boolean | ((a: IItem, b: IItem) => number);
  _style?: any;
  _props?: ITableHeaderCellProps;
  _classes?: string | string[] | Set<string> | { [klass: string]: any; };
  _labelTemplateId?: string;
  _data?: any
}

export interface ITableHeaderCellProps {
  /**
   * Sets the color context of the component to one of CoreUI’s themed colors.
   *
   * @type 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | string
   */
  color?: Colors;
  [key: string]: any;
}

export interface ISorter {
  resetable?: boolean;
  external?: boolean;
}

export interface IItem {
  _props?: ITableRowCellProps;
  _cellProps?: ITableCellProps;
  _selected?: boolean;
  _selectable?: boolean;
  [key: string]: number | string | any;
  // _deleted?: boolean;
}

export interface ITableCellProps {
  _all?: ITableRowCellProps;
  _attributes?: { [key: string]: any };
  [key: string]: ITableRowCellProps | undefined;
}

export interface IItemInternal extends IItem {
  _id?: number;
}

export interface ItemsPerPageSelect {
  external?: boolean;
  label?: string;
  values?: Array<number>;
}

// export interface ScopedColumns {
//   [key: string]: any
//   details?: (a: IItem, b: number) => ReactNode
// }

export interface ISorterValue {
  column?: string;
  state?: number | string;
}

export interface ITableFilter {
  lazy?: boolean;
  external?: boolean;
  label?: string;
  placeholder?: string;
  value?: string | number;
}

export interface ITableGroupProps extends ITableElementProps {
  attributes?: { [key: string]: any };
}
