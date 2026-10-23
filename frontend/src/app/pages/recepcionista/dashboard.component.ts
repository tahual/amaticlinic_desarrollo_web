import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { Cita, Medico, Paciente } from '../../core/models/models';

@Component({
  selector: 'app-recepcionista-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-1">Panel de recepcion</h1>
      <p class="text-gray-500 mb-6">Resumen general de la clinica.</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary">{{ citasHoy }}</p>
          <p class="text-sm text-gray-500 mt-1">Citas hoy</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary">{{ totalCitas }}</p>
          <p class="text-sm text-gray-500 mt-1">Citas totales</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary">{{ totalMedicos }}</p>
          <p class="text-sm text-gray-500 mt-1">Medicos</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary">{{ totalPacientes }}</p>
          <p class="text-sm text-gray-500 mt-1">Pacientes</p>
        </div>
      </div>

      <div class="grid md:grid-cols-4 gap-4">
        <a routerLink="/recepcionista/citas" class="card hover:shadow-md transition block">
          <p class="font-semibold text-gray-800">Citas</p>
          <p class="text-sm text-gray-500 mt-1">Gestionar todas las citas.</p>
        </a>
        <a routerLink="/recepcionista/medicos" class="card hover:shadow-md transition block">
          <p class="font-semibold text-gray-800">Medicos</p>
          <p class="text-sm text-gray-500 mt-1">Alta y edicion de medicos.</p>
        </a>
        <a routerLink="/recepcionista/horarios" class="card hover:shadow-md transition block">
          <p class="font-semibold text-gray-800">Horarios</p>
          <p class="text-sm text-gray-500 mt-1">Configurar disponibilidad.</p>
        </a>
        <a routerLink="/recepcionista/pacientes" class="card hover:shadow-md transition block">
          <p class="font-semibold text-gray-800">Pacientes</p>
          <p class="text-sm text-gray-500 mt-1">Administrar pacientes.</p>
        </a>
      </div>
    </main>
  `,
})
export class RecepcionistaDashboardComponent implements OnInit {
  citasHoy = 0;
  totalCitas = 0;
  totalMedicos = 0;
  totalPacientes = 0;

  constructor(private api: ApiService) {}

  ngOnInit() {
    const hoy = new Date().toISOString().slice(0, 10);
    this.api.listarCitas().subscribe((citas: Cita[]) => {
      this.totalCitas = citas.length;
      this.citasHoy = citas.filter((c) => c.fecha === hoy).length;
    });
    this.api.listarMedicos().subscribe((m: Medico[]) => (this.totalMedicos = m.length));
    this.api.listarPacientes().subscribe((p: Paciente[]) => (this.totalPacientes = p.length));
  }
}
