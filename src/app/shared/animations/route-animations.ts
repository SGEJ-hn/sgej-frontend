import { trigger, transition, style, animate } from '@angular/animations';

export const fadeAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ 
      opacity: 0, 
      transform: 'translateY(15px)' 
    }),
    
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ 
      opacity: 1, 
      transform: 'translateY(0)' 
    }))
  ])
]);