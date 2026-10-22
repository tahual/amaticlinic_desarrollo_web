import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { Medicamento, MovimientoInventario } from '../../core/models/models';

// [Farmacia] Kardex: historial de entradas, salidas por despacho y ajustes
@Component({
  selector: 'app-farmacia-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Movimientos de inventario</h1>
        <select class="input-field max-w-xs" [(ngModel)]="idMedicamento" (ngModelChange)="cargar()">
          <option [ngValue]="null">Todos los medicamentos</option>
          <option *ngFor="let m of medicamentos" [ngValue]="m.id">{{ m.nombre }} {{ m.presentacion }} {{ m.concentracion }}</option>
        </select>
      </div>

      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b">
              <th class="py-2 pr-4">Fecha</th>
              <th class="py-2 pr-4">Medicamento</th>
              <th class="py-2 pr-4">Tipo</th>
              <th class="py-2 pr-4 text-right">Cantidad</th>
              <th class="py-2 pr-4 text-right">Stock resultante</th>
              <th class="py-2 pr-4">Detalle</th>
              <th class="py-2">Usuario</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b last:border-0" *ngFor="let m of movimientos">
              <td class="py-2 pr-4 whitespace-nowrap">{{ m.fecha | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td class="py-2 pr-4">{{ m.medicamento }}</td>
              <td class="py-2 pr-4">
                <span class="badge"
                      [class.bg-green-100]="m.tipo === 'Entrada'" [class.text-green-700]="m.tipo === 'Entrada'"
                      [class.bg-blue-100]="m.tipo === 'Salida'" [class.text-blue-700]="m.tipo === 'Salida'"
                      [class.bg-amber-100]="m.tipo === 'Ajuste'" [class.text-amber-800]="m.tipo === 'Ajuste'">{{ m.tipo }}</span>
              </td>
              <td class="py-2 pr-4 text-right font-medium">{{ m.cantidad > 0 ? '+' : '' }}{{ m.cantidad }}</td>
              <td class="py-2 pr-4 text-right">{{ m.stockResultante }}</td>
              <td class="py-2 pr-4">
                {{ m.motivo }}
                <!-- [Farmacia] solo muestra el codigo si el motivo no lo incluye ya -->
                <span *ngIf="m.codigoReceta && !m.motivo?.includes(m.codigoReceta)" class="font-mono text-xs text-gray-500">({{ m.codigoReceta }})</span>
              </td>
              <td class="py-2 text-gray-500">{{ m.usuario }}</td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="!movimientos.length" class="text-gray-500 py-4">No hay movimientos registrados.</p>
      </div>
    </main>
  `,
})
export class FarmaciaMovimientosComponent implements OnInit {
  medicamentos: Medicamento[] = [];
  movimientos: MovimientoInventario[] = [];
  idMedicamento: number | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.listarMedicamentos('', true).subscribe((m) => (this.medicamentos = m));
    this.cargar();
  }

  cargar() {
    this.api.movimientosInventario(this.idMedicamento ?? undefined).subscribe((m) => (this.movimientos = m));
  }
}
