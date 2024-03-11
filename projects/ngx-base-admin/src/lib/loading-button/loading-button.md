### Loading Buttons

**CoreUI Angular Loading Buttons** interactive buttons with spinners

_examples_

```angular2html

<button (click)="onClick(i)" [color]="color" [loading]="loading[i]" cLoadingButton>Submit</button>

<button #btn (click)="onClick(j)" [disabledOnLoading]="false" [loading]="loading[j]" cLoadingButton>
  {{btn.loading ? 'Cancel' : 'Upload'}}
</button>
```

#### Loading Button API

```ts
import { LoadingButtonModule } from '@coreui/angular';
```

#### `cLoadingButton` directive

export name | description
---|---
exportAs: `cLoadingButton`| Defines the name that can be used in the template to assign this component to a variable.

prop|type|default|description
---|---|---|---
`loading`| `boolean`| _undefined_ | loading state
`spinnerType`| `border / grow` | _border_| spinner type
`disabledOnLoading`| `boolean` | _true_| disable mouse events on loading state 

---
