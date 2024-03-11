import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';

export const loadingButtonAnimation: AnimationTriggerMetadata =
  trigger('loadingButton', [
    transition(':enter', [
      style({
        opacity: 0,
        marginRight: '1rem',
        marginLeft: '-2rem'
      }),
      animate('.15s ease-in-out', style({
        opacity: 1,
        marginRight: '1rem',
        marginLeft: '0rem'
      }))
    ]),
    transition(':leave', [
      style({
        opacity: 1
      }),
      animate('.15s ease-in-out', style({
        opacity: 0,
        marginRight: '1rem',
        marginLeft: '-2rem'
      }))
    ])
  ]);
