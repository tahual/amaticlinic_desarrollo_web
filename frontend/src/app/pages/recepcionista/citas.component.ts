import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { Cita } from '../../core/models/models';

@Component({
  selector: 'app-recepcionista-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Citas</h1>

      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b">
              <th class="py-2 pr-4">Paciente</th>
              <th class="py-2 pr-4">Medico</th>
              <th class="py-2 pr-4">Fecha</th>
              <th class="py-2 pr-4">Horario</th>
              <th class="py-2 pr-4">Estado</th>
              <th class="py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b last:border-0" *ngFor="let c of citas">
              <td class="py-2 pr-4 font-medium text-gray-800">{{ c.nombrePaciente }}</td>
              <td class="py-2 pr-4">{{ c.nombreMedico }}</td>
              <td class="py-2 pr-4">{{ c.fecha }}</td>
              <td class="py-2 pr-4">{{ c.horaInicio }} - {{ c.horaFin }}</td>
              <td class="py-2 pr-4">
                <span class="badge bg-primary/10 text-primary">{{ c.estado }}</span>
              </td>
              <td class="py-2 text-right whitespace-nowrap">
                <button *ngIf="c.estado === 'Agendada' || c.estado === 'Modificada'"
                        class="text-sm text-red-600 hover:underline mr-3" (click)="cancelar(c)">Cancelar</button>
                <button class="text-sm text-red-700 hover:underline" (click)="eliminar(c)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="citas.length === 0" class="text-gray-500 py-4">No hay citas registradas.</p>
      </div>
    </main>
  `,
})
export class RecepcionistaCitasComponent implements OnInit {
  citas: Cita[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.api.listarCitas().subscribe((c) => (this.citas = c));
  }

  cancelar(c: Cita) {
    if (!confirm('Cancelar esta cita?')) return;
    this.api.cancelarCita(c.id).subscribe(() => this.cargar());
  }

  eliminar(c: Cita) {
    if (!confirm('Eliminar definitivamente esta cita?')) return;
    this.api.eliminarCita(c.id).subscribe(() => this.cargar());
  }
}
