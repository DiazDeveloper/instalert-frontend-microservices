import { Routes } from '@angular/router';
import { accountGuard, adminGuard } from './account/application/account.guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./account/presentation/views/login-view/login-view').then((m) => m.LoginView),
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./account/presentation/views/register-view/register-view').then(
        (m) => m.RegisterView,
      ),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/presentation/views/admin-dashboard/admin-dashboard').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'app',
    canActivate: [accountGuard],
    canActivateChild: [accountGuard],
    loadComponent: () =>
      import('./shared/presentation/components/layout/layout').then((m) => m.Layout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./shared/presentation/views/dashboard/dashboard').then(
            (m) => m.DashboardViewComponent,
          ),
      },
      {
        path: 'boton-panico',
        loadComponent: () =>
          import('./emergencies/presentation/views/emergencies-view/emergencies-view').then(
            (m) => m.EmergenciesViewComponent,
          ),
      },
      {
        path: 'comunidades',
        loadComponent: () =>
          import('./communities/presentation/views/monitoring-panel-view/monitoring-panel-view').then(
            (m) => m.MonitoringPanelView,
          ),
      },
      {
        path: 'mapa-riesgo',
        redirectTo: 'reportes',
        pathMatch: 'full',
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./incidents/presentation/views/report-views/report-views').then(
            (m) => m.ReportesComponent,
          ),
      },
      {
        path: 'crear-reporte',
        loadComponent: () =>
          import('./incidents/presentation/views/create-report/create-report').then(
            (m) => m.CrearReporteComponent,
          ),
      },

      {
        path: 'perfil',
        loadComponent: () =>
          import('./account/presentation/views/profile-settings-view/profile-settings-view').then(
            (m) => m.ProfileSettingsView,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
