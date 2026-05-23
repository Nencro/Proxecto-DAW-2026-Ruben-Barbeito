import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProfileTravelsComponent } from './components/profile-travels/profile-travels.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchComponent } from './components/search/search.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const rutas: Routes = [
  {
    path: '',
    component: HomeComponent
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
  },
  {
    path: 'fly/search',
    component: SearchComponent
  },
  {
    path: 'hotel/search',
    component: SearchComponent
  }
];
