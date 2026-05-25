import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PasswordRecoverComponent } from './components/password-recover/password-recover.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { SearchComponent } from './components/search/pages/search-page/search.component';
import { HomeComponent } from './components/home/home.component';
import { ExperienceCreateComponent } from './components/experiences/experience-create.component';
import { ExperienceDetailsComponent } from './components/experiences/experience-details.component';
import { ExperiencesComponent } from './components/experiences/experiences.component';
import { BusinessContactComponent } from './components/help/business-contact.component';
import { ContactComponent } from './components/help/contact.component';
import { FaqComponent } from './components/help/faq.component';
import { HelpCenterComponent } from './components/help/help-center.component';
import { CookiesPolicyComponent } from './components/legal/cookies-policy.component';
import { LegalNoticeComponent } from './components/legal/legal-notice.component';
import { TermsComponent } from './components/legal/terms.component';
import { TravelCreateComponent } from './components/travels/travel-create.component';
import { TravelDetailsComponent } from './components/travels/travel-details.component';
import { TravelJoinComponent } from './components/travels/travel-join.component';
import { TravelsComponent } from './components/travels/travels.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const rutas: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'profile/:userName',
    component: ProfileComponent,
    canActivate: [adminGuard]
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
    path: 'travels/details/:id',
    component: TravelDetailsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'travels/join/:token',
    component: TravelJoinComponent
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
    path: 'password/recover',
    component: PasswordRecoverComponent,
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
    path: 'experiences',
    component: ExperiencesComponent
  },
  {
    path: 'experiences/new',
    component: ExperienceCreateComponent,
    canActivate: [authGuard]
  },
  {
    path: 'experiences/details/:id',
    component: ExperienceDetailsComponent
  },
  {
    path: 'work-with-us',
    component: BusinessContactComponent
  },
  {
    path: 'help',
    component: HelpCenterComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'faq',
    component: FaqComponent
  },
  {
    path: 'aviso-legal',
    component: LegalNoticeComponent
  },
  {
    path: 'cookies',
    component: CookiesPolicyComponent
  },
  {
    path: 'condiciones',
    component: TermsComponent
  },
  {
    path: 'fly/search',
    component: SearchComponent
  },
];
