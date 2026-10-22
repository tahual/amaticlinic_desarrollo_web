import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar.component';
import { ApiService } from '../../core/services/api.service';
import { Medicamento } from '../../core/models/models';

interface FormMedicamento {
  id?: number;
  nombre: string;
  principioActivo: string;
  presentacion: string;
  concentracion: string;
  stock: number;
  stockMinimo: number;
  precio: number;
  requiereReceta: boolean;
}

function formVacio(): FormMedicamento {
  return { nombre: '', principioActivo: '', presentacion: 'Tableta', concentracion: '', stock: 0, stockMinimo: 10, precio: 0, requiereReceta: true };
}

// [Farmacia] Catalogo e inventario: altas, edicion, entradas de mercaderia y ajustes
@Component({
  selector: 'app-farmacia-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Inventario</h1>
        <button class="btn-primary" (click)="nuevo()">+ Nuevo medicamento</button>
      </div>

      <div *ngIf="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ error }}</div>
      <div *ngIf="mensaje" class="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{{ mensaje }}</div>

      <!-- Alta / edicion -->
      <div class="card mb-6" *ngIf="form">
        <h2 class="font-semibold text-gray-800 mb-4">{{ form.id ? 'Editar' : 'Nuevo' }} medicamento</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label class="label-field">Nombre</label><input class="input-field" [(ngModel)]="form.nombre" /></div>
          <div><label class="label-field">Principio activo</label><input class="input-field" [(ngModel)]="form.principioActivo" /></div>
          <div><label class="label-field">Presentacion</label><input class="input-field" [(ngModel)]="form.presentacion" /></div>
          <div><label class="label-field">Concentracion</label><input class="input-field" [(ngModel)]="form.concentracion" placeholder="500 mg" /></div>
          <div *ngIf="!form.id"><label class="label-field">Stock inicial</label><input class="input-field" type="number" min="0" [(ngModel)]="form.stock" /></div>
          <div><label class="label-field">Stock minimo</label><input class="input-field" type="number" min="0" [(ngModel)]="form.stockMinimo" /></div>
          <div><label class="label-field">Precio (Q)</label><input class="input-field" type="number" min="0" step="0.01" [(ngModel)]="form.precio" /></div>
          <label class="flex items-center gap-2 text-sm mt-6"><input type="checkbox" [(ngModel)]="form.requiereReceta" /> Requiere receta</label>
        </div>
        <p *ngIf="form.id" class="text-xs text-gray-500 mt-3">El stock no se edita aqui: usa Entrada o Ajuste para que quede registrado en el kardex.</p>
        <div class="flex gap-3 mt-5">
          <button class="btn-primary" (click)="guardar()">Guardar</button>
          <button class="btn-secondary" (click)="form = null">Cancelar</button>
        </div>
      </div>

      <!-- Entrada / ajuste de stock -->
      <div class="card mb-6" *ngIf="operacion && seleccionado">
        <h2 class="font-semibold text-gray-800 mb-1">{{ operacion === 'entrada' ? 'Entrada de mercaderia' : 'Ajuste de inventario' }}</h2>
        <p class="text-sm text-gray-500 mb-4">{{ seleccionado.nombre }} {{ seleccionado.presentacion }} {{ seleccionado.concentracion }} — stock actual {{ seleccionado.stock }}</p>
        <div class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="label-field">{{ operacion === 'entrada' ? 'Unidades recibidas' : 'Unidades (+ suma, - resta)' }}</label>
            <input class="input-field" type="number" [(ngModel)]="cantidadOp" />
          </div>
          <div class="sm:col-span-2">
            <label class="label-field">Motivo {{ operacion === 'ajuste' ? '(obligatorio)' : '' }}</label>
            <input class="input-field" [(ngModel)]="motivoOp" [placeholder]="operacion === 'entrada' ? 'Compra a proveedor, factura #...' : 'Merma, vencimiento, conteo fisico...'" />
          </div>
        </div>
        <div class="flex gap-3 mt-5">
          <button class="btn-primary" (click)="aplicarOperacion()">Registrar</button>
          <button class="btn-secondary" (click)="operacion = null">Cancelar</button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-4">
        <input class="input-field max-w-xs" placeholder="Buscar por nombre o principio activo" [(ngModel)]="buscar" (ngModelChange)="cargar()" />
        <label class="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" [(ngModel)]="verInactivos" (ngModelChange)="cargar()" /> Mostrar desactivados
        </label>
      </div>

      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b">
              <th class="py-2 pr-4">Medicamento</th>
              <th class="py-2 pr-4">Principio activo</th>
              <th class="py-2 pr-4 text-right">Stock</th>
              <th class="py-2 pr-4 text-right">Minimo</th>
              <th class="py-2 pr-4 text-right">Precio</th>
              <th class="py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b last:border-0" *ngFor="let m of medicamentos" [class.opacity-50]="!m.activo">
              <td class="py-2 pr-4">
                <p class="font-medium text-gray-800">{{ m.nombre }}</p>
                <p class="text-xs text-gray-500">{{ m.presentacion }} {{ m.concentracion }}{{ m.requiereReceta ? ' · con receta' : ' · venta libre' }}</p>
              </td>
              <td class="py-2 pr-4">{{ m.principioActivo }}</td>
              <td class="py-2 pr-4 text-right">
                <span class="font-semibold" [class.text-red-700]="m.stockBajo">{{ m.stock }}</span>
                <span *ngIf="m.stockBajo && m.activo" class="badge bg-red-100 text-red-700 ml-2">Bajo</span>
              </td>
              <td class="py-2 pr-4 text-right text-gray-500">{{ m.stockMinimo }}</td>
              <td class="py-2 pr-4 text-right">Q {{ m.precio | number: '1.2-2' }}</td>
              <td class="py-2 text-right whitespace-nowrap">
                <ng-container *ngIf="m.activo; else inactivo">
                  <button class="text-sm text-primary hover:underline mr-3" (click)="abrirOperacion(m, 'entrada')">Entrada</button>
                  <button class="text-sm text-primary hover:underline mr-3" (click)="abrirOperacion(m, 'ajuste')">Ajuste</button>
                  <button class="text-sm text-primary hover:underline mr-3" (click)="editar(m)">Editar</button>
                  <button class="text-sm text-red-700 hover:underline" (click)="desactivar(m)">Desactivar</button>
                </ng-container>
                <ng-template #inactivo>
                  <button class="text-sm text-primary hover:underline" (click)="reactivar(m)">Reactivar</button>
                </ng-template>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="!medicamentos.length" class="text-gray-500 py-4">No hay medicamentos para mostrar.</p>
      </div>
    </main>
  `,
})
export class FarmaciaInventarioComponent implements OnInit {
  medicamentos: Medicamento[] = [];
  buscar = '';
  verInactivos = false;
  form: FormMedicamento | null = null;
  seleccionado: Medicamento | null = null;
  operacion: 'entrada' | 'ajuste' | null = null;
  cantidadOp = 0;
  motivoOp = '';
  error = '';
  mensaje = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.api.listarMedicamentos(this.buscar.trim(), this.verInactivos).subscribe((m) => (this.medicamentos = m));
  }

  private limpiarAvisos() {
    this.error = '';
    this.mensaje = '';
  }

  private mostrarError(e: any, porDefecto: string) {
    const err = e?.error;
    this.error = err?.error ?? (Array.isArray(err?.errors) ? err.errors.join(', ') : porDefecto);
  }

  nuevo() {
    this.limpiarAvisos();
    this.operacion = null;
    this.form = formVacio();
  }

  editar(m: Medicamento) {
    this.limpiarAvisos();
    this.operacion = null;
    this.form = { ...m, concentracion: m.concentracion ?? '' };
  }

  guardar() {
    if (!this.form) return;
    this.limpiarAvisos();
    const { id, stock, ...datos } = this.form;
    const peticion = id ? this.api.actualizarMedicamento(id, datos) : this.api.crearMedicamento({ ...datos, stock });
    peticion.subscribe({
      next: (m) => {
        this.mensaje = `${m.nombre} guardado.`;
        this.form = null;
        this.cargar();
      },
      error: (e) => this.mostrarError(e, 'No se pudo guardar el medicamento'),
    });
  }

  abrirOperacion(m: Medicamento, tipo: 'entrada' | 'ajuste') {
    this.limpiarAvisos();
    this.form = null;
    this.seleccionado = m;
    this.operacion = tipo;
    this.cantidadOp = tipo === 'entrada' ? 10 : 0;
    this.motivoOp = '';
  }

  aplicarOperacion() {
    if (!this.seleccionado || !this.operacion) return;
    this.limpiarAvisos();
    const m = this.seleccionado;
    const peticion = this.operacion === 'entrada'
      ? this.api.entradaStock(m.id, this.cantidadOp, this.motivoOp)
      : this.api.ajusteStock(m.id, this.cantidadOp, this.motivoOp);
    peticion.subscribe({
      next: (act) => {
        this.mensaje = `${act.nombre}: stock actualizado a ${act.stock} unidades.`;
        this.operacion = null;
        this.cargar();
      },
      error: (e) => this.mostrarError(e, 'No se pudo registrar el movimiento'),
    });
  }

  desactivar(m: Medicamento) {
    if (!confirm(`Desactivar ${m.nombre}? Ya no podra recetarse, pero conserva su historial.`)) return;
    this.limpiarAvisos();
    this.api.desactivarMedicamento(m.id).subscribe({
      next: () => this.cargar(),
      error: (e) => this.mostrarError(e, 'No se pudo desactivar'),
    });
  }

  reactivar(m: Medicamento) {
    this.limpiarAvisos();
    this.api.actualizarMedicamento(m.id, { activo: true }).subscribe({
      next: () => this.cargar(),
      error: (e) => this.mostrarError(e, 'No se pudo reactivar'),
    });
  }
}
