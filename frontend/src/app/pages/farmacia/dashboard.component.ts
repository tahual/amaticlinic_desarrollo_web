import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Medicamento, ResumenFarmacia } from '../../core/models/models';

// [Farmacia] Panel de inicio del farmaceutico
@Component({
  selector: 'app-farmacia-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-1">Farmacia</h1>
      <p class="text-gray-500 mb-6">Hola, {{ auth.user()?.nombre }}. Este es el estado de la farmacia hoy.</p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" *ngIf="resumen">
        <a routerLink="/farmacia/despacho" class="card text-center hover:shadow-md transition">
          <p class="text-3xl font-bold text-primary">{{ resumen.recetasPendientes }}</p>
          <p class="text-sm text-gray-500 mt-1">Recetas por despachar</p>
        </a>
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary">{{ resumen.recetasDespachadasHoy }}</p>
          <p class="text-sm text-gray-500 mt-1">Recetas despachadas hoy</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-primary">{{ resumen.unidadesDespachadasHoy }}</p>
          <p class="text-sm text-gray-500 mt-1">Unidades entregadas hoy</p>
        </div>
        <a routerLink="/farmacia/inventario" class="card text-center hover:shadow-md transition">
          <p class="text-3xl font-bold" [class.text-red-700]="resumen.medicamentosStockBajo > 0"
             [class.text-primary]="resumen.medicamentosStockBajo === 0">{{ resumen.medicamentosStockBajo }}</p>
          <p class="text-sm text-gray-500 mt-1">Con stock bajo (de {{ resumen.medicamentosActivos }})</p>
        </a>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div class="card">
          <h2 class="font-semibold text-gray-800 mb-3">Reabastecer pronto</h2>
          <table class="w-full text-sm" *ngIf="stockBajo.length">
            <thead>
              <tr class="text-left text-gray-500 border-b">
                <th class="py-2 pr-4">Medicamento</th>
                <th class="py-2 pr-4 text-right">Stock</th>
                <th class="py-2 text-right">Minimo</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b last:border-0" *ngFor="let m of stockBajo">
                <td class="py-2 pr-4">{{ m.nombre }} <span class="text-gray-500">{{ m.presentacion }} {{ m.concentracion }}</span></td>
                <td class="py-2 pr-4 text-right font-semibold" [class.text-red-700]="m.stock === 0">{{ m.stock }}</td>
                <td class="py-2 text-right text-gray-500">{{ m.stockMinimo }}</td>
              </tr>
            </tbody>
          </table>
          <p *ngIf="!stockBajo.length" class="text-sm text-gray-500">Todos los medicamentos estan sobre su stock minimo.</p>
        </div>

        <div class="card" *ngIf="resumen">
          <h2 class="font-semibold text-gray-800 mb-1">Mas despachados</h2>
          <p class="text-xs text-gray-500 mb-4">Unidades entregadas en los ultimos 30 dias</p>
          <div class="space-y-3" *ngIf="resumen.masDespachados30Dias.length">
            <div *ngFor="let r of resumen.masDespachados30Dias" [title]="r.medicamento + ': ' + r.unidades + ' unidades'">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-700">{{ r.medicamento }}</span>
                <span class="text-gray-800 font-medium">{{ r.unidades }}</span>
              </div>
              <div class="h-2 bg-gray-100 rounded">
                <div class="h-2 bg-primary rounded" [style.width.%]="(r.unidades / maxUnidades()) * 100"></div>
              </div>
            </div>
          </div>
          <p *ngIf="!resumen.masDespachados30Dias.length" class="text-sm text-gray-500">Aun no hay despachos registrados.</p>
        </div>
      </div>
    </main>
  `,
})
export class FarmaciaDashboardComponent implements OnInit {
  resumen: ResumenFarmacia | null = null;
  stockBajo: Medicamento[] = [];

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.api.resumenFarmacia().subscribe((r) => (this.resumen = r));
    this.api.medicamentosStockBajo().subscribe((m) => (this.stockBajo = m));
  }

  maxUnidades(): number {
    return Math.max(1, ...(this.resumen?.masDespachados30Dias.map((r) => r.unidades) ?? [1]));
  }
}
