import { Routes } from '@angular/router';
import { onboardingGuard } from './guards/onboarding.guard';

export const ONBOARDING_ROUTES: Routes = [
  {
    path: '',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./pages/onboarding/onboarding.page').then(
        (m) => m.OnboardingPage,
      ),
  },
];
