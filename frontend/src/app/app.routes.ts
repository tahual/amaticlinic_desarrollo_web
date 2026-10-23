import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';

import { PacienteDashboardComponent } from './pages/paciente/dashboard.component';
import { AgendarCitaComponent } from './pages/paciente/agendar-cita.component';
import { MisCitasComponent } from './pages/paciente/mis-citas.component';
import { PacienteMedicosComponent } from './pages/paciente/medicos.component';

import { MedicoDashboardComponent } from './pages/medico/dashboard.component';
import { MedicoCitasComponent } from './pages/medico/citas.component';
import { CitaDetalleComponent } from './pages/medico/cita-detalle.component';
import { MedicoPacientesComponent } from './pages/medico/pacientes.component';
import { PacienteDetalleComponent } from './pages/medico/paciente-detalle.component';
import { MedicoHistorialComponent } from './pages/medico/historial.component';

import { RecepcionistaDashboardComponent } from './pages/recepcionista/dashboard.component';
import { RecepcionistaCitasComponent } from './pages/recepcionista/citas.component';
import { RecepcionistaMedicosComponent } from './pages/recepcionista/medicos.component';
import { RecepcionistaHorariosComponent } from './pages/recepcionista/horarios.component';
import { RecepcionistaPacientesComponent } from './pages/recepcionista/pacientes.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },

  // Paciente
  { path: 'paciente/dashboard', component: PacienteDashboardComponent, canActivate: [authGuard], data: { roles: ['Paciente'] } },
  { path: 'paciente/agendar', component: AgendarCitaComponent, canActivate: [authGuard], data: { roles: ['Paciente'] } },
  { path: 'paciente/mis-citas', component: MisCitasComponent, canActivate: [authGuard], data: { roles: ['Paciente'] } },
  { path: 'paciente/medicos', component: PacienteMedicosComponent, canActivate: [authGuard], data: { roles: ['Paciente'] } },

  // Medico
  { path: 'medico/dashboard', component: MedicoDashboardComponent, canActivate: [authGuard], data: { roles: ['Medico'] } },
  { path: 'medico/citas', component: MedicoCitasComponent, canActivate: [authGuard], data: { roles: ['Medico'] } },
  { path: 'medico/citas/:id', component: CitaDetalleComponent, canActivate: [authGuard], data: { roles: ['Medico'] } },
  { path: 'medico/pacientes', component: MedicoPacientesComponent, canActivate: [authGuard], data: { roles: ['Medico'] } },
  { path: 'medico/pacientes/:id', component: PacienteDetalleComponent, canActivate: [authGuard], data: { roles: ['Medico'] } },
  { path: 'medico/historial', component: MedicoHistorialComponent, canActivate: [authGuard], data: { roles: ['Medico'] } },

  // Recepcionista
  { path: 'recepcionista/dashboard', component: RecepcionistaDashboardComponent, canActivate: [authGuard], data: { roles: ['Recepcionista'] } },
  { path: 'recepcionista/citas', component: RecepcionistaCitasComponent, canActivate: [authGuard], data: { roles: ['Recepcionista'] } },
  { path: 'recepcionista/medicos', component: RecepcionistaMedicosComponent, canActivate: [authGuard], data: { roles: ['Recepcionista'] } },
  { path: 'recepcionista/horarios', component: RecepcionistaHorariosComponent, canActivate: [authGuard], data: { roles: ['Recepcionista'] } },
  { path: 'recepcionista/pacientes', component: RecepcionistaPacientesComponent, canActivate: [authGuard], data: { roles: ['Recepcionista'] } },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
