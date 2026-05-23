import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProfileTravelsComponent } from './components/profile-travels/profile-travels.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchComponent } from './components/search/search.component';
import { TravelSearchComponent } from './components/travel-search/travel-search.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const rutas: Routes = [
  {
    path: '',
    component: TravelSearchComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile/travels',
    component: ProfileTravelsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'search',
    component: SearchComponent
  }
];
