import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/pages/login/login.component';
import { PasswordRecoverComponent } from './components/auth/pages/password-recover/password-recover.component';
import { ProfileComponent } from './components/profile/pages/profile/profile.component';
import { ProfileSearchComponent } from './components/profile/pages/profile-search/profile-search.component';
import { RegisterComponent } from './components/auth/pages/register/register.component';
import { SearchComponent } from './components/search/pages/search-page/search.component';
import { HomeComponent } from './components/home/pages/home/home.component';
import { ExperienceCreateComponent } from './components/experiences/pages/experience-create/experience-create.component';
import { ExperienceDetailsComponent } from './components/experiences/pages/experience-details/experience-details.component';
import { ExperiencesComponent } from './components/experiences/pages/experiences/experiences.component';
import { BusinessContactComponent } from './components/help/pages/business-contact/business-contact.component';
import { ContactComponent } from './components/help/pages/contact/contact.component';
import { FaqComponent } from './components/help/pages/faq/faq.component';
import { HelpCenterComponent } from './components/help/pages/help-center/help-center.component';
import { CookiesPolicyComponent } from './components/legal/pages/cookies-policy/cookies-policy.component';
import { LegalNoticeComponent } from './components/legal/pages/legal-notice/legal-notice.component';
import { TermsComponent } from './components/legal/pages/terms/terms.component';
import { TravelCreateComponent } from './components/travels/pages/travel-create/travel-create.component';
import { TravelDetailsComponent } from './components/travels/pages/travel-details/travel-details.component';
import { TravelJoinComponent } from './components/travels/pages/travel-join/travel-join.component';
import { TravelsComponent } from './components/travels/pages/travels/travels.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const rutas: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'ExploraMas | Viajes, vuelos y experiencias'
  },
  {
    path: 'profile/search',
    component: ProfileSearchComponent,
    canActivate: [adminGuard],
    title: 'Usuarios | ExploraMas'
  },
  {
    path: 'profile/:userName',
    component: ProfileComponent,
    canActivate: [adminGuard],
    title: 'Perfil de usuario | ExploraMas'
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    title: 'Mi perfil | ExploraMas'
  },
  {
    path: 'travels/new',
    component: TravelCreateComponent,
    canActivate: [authGuard],
    title: 'Crear viaje | ExploraMas'
  },
  {
    path: 'travels/details/:id',
    component: TravelDetailsComponent,
    canActivate: [authGuard],
    title: 'Detalle del viaje | ExploraMas'
  },
  {
    path: 'travels/join/:token',
    component: TravelJoinComponent,
    title: 'Unirse a un viaje | ExploraMas'
  },
  {
    path: 'travels',
    component: TravelsComponent,
    canActivate: [authGuard],
    title: 'Mis viajes | ExploraMas'
  },
  {
    path: 'profile/travels',
    redirectTo: 'travels'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
    title: 'Login | ExploraMas'
  },
  {
    path: 'password/recover',
    component: PasswordRecoverComponent,
    canActivate: [guestGuard],
    title: 'Recuperar password | ExploraMas'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Registro | ExploraMas'
  },
  {
    path: 'search',
    component: SearchComponent,
    title: 'Buscar vuelos | ExploraMas'
  },
  {
    path: 'experiences',
    component: ExperiencesComponent,
    title: 'Experiencias | ExploraMas'
  },
  {
    path: 'experiences/new',
    component: ExperienceCreateComponent,
    canActivate: [authGuard],
    title: 'Crear experiencia | ExploraMas'
  },
  {
    path: 'experiences/details/:id',
    component: ExperienceDetailsComponent,
    title: 'Detalle de experiencia | ExploraMas'
  },
  {
    path: 'work-with-us',
    component: BusinessContactComponent,
    title: 'Trabaja con nosotros | ExploraMas'
  },
  {
    path: 'help',
    component: HelpCenterComponent,
    title: 'Ayuda | ExploraMas'
  },
  {
    path: 'contact',
    component: ContactComponent,
    title: 'Contacto | ExploraMas'
  },
  {
    path: 'faq',
    component: FaqComponent,
    title: 'Preguntas frecuentes | ExploraMas'
  },
  {
    path: 'aviso-legal',
    component: LegalNoticeComponent,
    title: 'Aviso legal | ExploraMas'
  },
  {
    path: 'cookies',
    component: CookiesPolicyComponent,
    title: 'Politica de cookies | ExploraMas'
  },
  {
    path: 'condiciones',
    component: TermsComponent,
    title: 'Condiciones de uso | ExploraMas'
  },
  {
    path: 'fly/search',
    component: SearchComponent,
    title: 'Buscar vuelos | ExploraMas'
  },
];
