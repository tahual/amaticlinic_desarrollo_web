import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Medico, SlotDisponible } from '../../core/models/models';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <main class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Agendar una cita</h1>

      <div *ngIf="mensajeExito" class="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        {{ mensajeExito }}
      </div>
      <div *ngIf="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        {{ error }}
      </div>

      <div class="card space-y-5">
        <div>
          <label class="label-field">Medico</label>
          <select class="input-field" [(ngModel)]="idMedico" (ngModelChange)="onMedicoChange()">
            <option [ngValue]="null">Selecciona un medico</option>
            <option *ngFor="let m of medicos" [ngValue]="m.id">
              Dr(a). {{ m.nombre }} {{ m.apellido }} — {{ m.especialidad }}
            </option>
          </select>
        </div>

        <div>
          <label class="label-field">Fecha</label>
          <input class="input-field" type="date" [(ngModel)]="fecha" (ngModelChange)="onFechaChange()" [min]="hoy" />
        </div>

        <div *ngIf="slots.length > 0">
          <label class="label-field">Horarios disponibles</label>
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
            <button type="button" *ngFor="let s of slots" [disabled]="s.ocupado"
                    (click)="slotSeleccionado = s"
                    class="text-sm px-2 py-2 rounded-lg border transition"
                    [class.bg-primary]="slotSeleccionado === s"
                    [class.text-white]="slotSeleccionado === s"
                    [class.border-primary]="slotSeleccionado === s"
                    [class.bg-gray-100]="s.ocupado"
                    [class.text-gray-400]="s.ocupado"
                    [class.cursor-not-allowed]="s.ocupado">
              {{ s.etiqueta }}
            </button>
          </div>
        </div>
        <p *ngIf="fecha && idMedico && slots.length === 0" class="text-sm text-gray-500">
          Este medico no tiene horario configurado para el dia seleccionado.
        </p>

        <div>
          <label class="label-field">Motivo de la consulta (opcional)</label>
          <textarea class="input-field" rows="3" [(ngModel)]="motivoConsulta"></textarea>
        </div>

        <button class="btn-primary w-full" [disabled]="!puedeAgendar() || cargando" (click)="agendar()">
          {{ cargando ? 'Agendando...' : 'Confirmar cita' }}
        </button>
      </div>
    </main>
  `,
})
export class AgendarCitaComponent implements OnInit {
  medicos: Medico[] = [];
  idMedico: number | null = null;
  fecha = '';
  hoy = new Date().toISOString().slice(0, 10);
  slots: SlotDisponible[] = [];
  slotSeleccionado: SlotDisponible | null = null;
  motivoConsulta = '';
  horarioIdSeleccionado: number | null = null;
  cargando = false;
  error = '';
  mensajeExito = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.api.listarMedicos().subscribe((m) => (this.medicos = m));
    const idMedicoParam = this.route.snapshot.queryParamMap.get('idMedico');
    if (idMedicoParam) this.idMedico = Number(idMedicoParam);
  }

  onMedicoChange() {
    this.slots = [];
    this.slotSeleccionado = null;
    if (this.fecha) this.onFechaChange();
  }

  onFechaChange() {
    this.slots = [];
    this.slotSeleccionado = null;
    if (this.idMedico && this.fecha) {
      this.api.slotsDisponibles(this.idMedico, this.fecha).subscribe((s) => (this.slots = s));
      // Tambien necesitamos el idHorario real del dia seleccionado para enviarlo en el POST
      this.api.listarHorariosPorMedico(this.idMedico).subscribe((horarios) => {
        const diaSemana = this.diaSemanaDe(this.fecha);
        const horario = horarios.find((h) => h.diaSemana === diaSemana);
        this.horarioIdSeleccionado = horario ? horario.id : null;
      });
    }
  }

  private diaSemanaDe(fecha: string) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    return dias[new Date(fecha + 'T00:00:00').getDay()];
  }

  puedeAgendar() {
    return this.idMedico && this.fecha && this.slotSeleccionado && this.horarioIdSeleccionado;
  }

  agendar() {
    this.error = '';
    this.mensajeExito = '';
    this.cargando = true;
    const idPaciente = this.auth.user()?.idPerfil;

    this.api
      .agendarCita({
        idPaciente,
        idMedico: this.idMedico,
        idHorario: this.horarioIdSeleccionado,
        fecha: this.fecha,
        horaInicio: this.slotSeleccionado!.horaInicio,
        horaFin: this.slotSeleccionado!.horaFin,
        motivoConsulta: this.motivoConsulta,
      })
      .subscribe({
        next: () => {
          this.mensajeExito = 'Cita agendada correctamente.';
          this.cargando = false;
          this.onFechaChange();
          this.motivoConsulta = '';
        },
        error: (e) => {
          this.error = e?.error?.error ?? 'No se pudo agendar la cita';
          this.cargando = false;
        },
      });
  }
}
