import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar.component';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Estadisticas } from '../../core/models/models';

@Component({
  selector: 'app-paciente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-1">Hola, {{ auth.user()?.nombre }} 👋</h1>
      <p class="text-gray-500 mb-6">Este es el resumen de tus citas medicas.</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" *ngIf="stats">
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary">{{ stats.citasProgramadas }}</p>
          <p class="text-sm text-gray-500 mt-1">Citas programadas</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary">{{ stats.diasProximaCita }}</p>
          <p class="text-sm text-gray-500 mt-1">Dias para tu proxima cita</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary">{{ stats.citasEsteMes }}</p>
          <p class="text-sm text-gray-500 mt-1">Citas este mes</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary">{{ stats.medicosDisponibles }}</p>
          <p class="text-sm text-gray-500 mt-1">Medicos disponibles</p>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-4">
        <a routerLink="/paciente/agendar" class="card hover:shadow-md transition block">
          <p class="font-semibold text-gray-800">Agendar una cita</p>
          <p class="text-sm text-gray-500 mt-1">Busca un medico y reserva un horario disponible.</p>
        </a>
        <a routerLink="/paciente/mis-citas" class="card hover:shadow-md transition block">
          <p class="font-semibold text-gray-800">Mis citas</p>
          <p class="text-sm text-gray-500 mt-1">Consulta, cancela o reprograma tus citas.</p>
        </a>
        <a routerLink="/paciente/medicos" class="card hover:shadow-md transition block">
          <p class="font-semibold text-gray-800">Buscar medicos</p>
          <p class="text-sm text-gray-500 mt-1">Explora medicos por especialidad.</p>
        </a>
      </div>
    </main>
  `,
})
export class PacienteDashboardComponent implements OnInit {
  stats: Estadisticas | null = null;

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    const idPaciente = this.auth.user()?.idPerfil;
    if (idPaciente) {
      this.api.estadisticasPaciente(idPaciente).subscribe((s) => (this.stats = s));
    }
  }
}
