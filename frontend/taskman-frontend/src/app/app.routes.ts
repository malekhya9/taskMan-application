import { Routes } from '@angular/router';
import { AuthGuard, LeadGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'tasks', loadComponent: () => import('./components/task-list/task-list').then(m => m.TaskListComponent), canActivate: [AuthGuard] },
  { path: 'tasks/:id', loadComponent: () => import('./components/task-detail/task-detail').then(m => m.TaskDetailComponent), canActivate: [AuthGuard] },
  { path: 'invite', loadComponent: () => import('./components/invite/invite').then(m => m.InviteComponent), canActivate: [LeadGuard] },
  { path: 'invite/:email', loadComponent: () => import('./components/invite/invite').then(m => m.InviteComponent) },
  { path: '**', redirectTo: '/dashboard' }
];
