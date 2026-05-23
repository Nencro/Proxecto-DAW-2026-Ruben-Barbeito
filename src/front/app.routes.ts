import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchComponent } from './components/search/pages/search-page/search.component';
import { HomeComponent } from './components/home/home.component';
import { TravelCreateComponent } from './components/travels/travel-create.component';
import { TravelsComponent } from './components/travels/travels.component';
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
    path: 'travels/new',
    component: TravelCreateComponent,
    canActivate: [authGuard]
  },
  {
    path: 'travels',
    component: TravelsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile/travels',
    redirectTo: 'travels'
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
];
