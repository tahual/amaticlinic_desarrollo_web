import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { Cita } from '../../core/models/models';

@Component({
  selector: 'app-cita-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="max-w-2xl mx-auto px-4 py-8" *ngIf="cita as c">
      <button (click)="volver()" class="text-sm text-primary mb-4 hover:underline">&larr; Volver a mi agenda</button>
      <div class="card space-y-3">
        <h1 class="text-xl font-bold text-gray-800">Detalle de la cita</h1>
        <p><span class="text-gray-500">Paciente:</span> <span class="font-medium">{{ c.nombrePaciente }}</span></p>
        <p><span class="text-gray-500">Fecha:</span> {{ c.fecha }}</p>
        <p><span class="text-gray-500">Horario:</span> {{ c.horaInicio }} - {{ c.horaFin }}</p>
        <p><span class="text-gray-500">Motivo de consulta:</span> {{ c.motivoConsulta || 'No especificado' }}</p>
        <p><span class="text-gray-500">Estado:</span> <span class="badge bg-primary/10 text-primary">{{ c.estado }}</span></p>

        <div class="flex gap-3 pt-4" *ngIf="c.estado === 'Agendada' || c.estado === 'Modificada'">
          <button class="btn-primary" (click)="completar()">Marcar como completada</button>
          <button class="btn-secondary" (click)="cancelar()">Cancelar cita</button>
        </div>
      </div>

    </main>
  `,
})
export class CitaDetalleComponent implements OnInit {
  cita: Cita | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.obtenerCita(id).subscribe((c) => (this.cita = c));
  }

  completar() {
    if (!this.cita) return;
    this.api.completarCita(this.cita.id).subscribe((c) => (this.cita = c));
  }

  cancelar() {
    if (!this.cita || !confirm('Deseas cancelar esta cita?')) return;
    this.api.cancelarCita(this.cita.id).subscribe((c) => (this.cita = c));
  }

  volver() {
    this.router.navigate(['/medico/citas']);
  }
}
