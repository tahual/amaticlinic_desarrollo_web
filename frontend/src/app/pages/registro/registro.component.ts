import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-primary-dark px-4 py-10">
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <div class="w-14 h-14 mx-auto rounded-full bg-accent flex items-center justify-center font-bold text-2xl text-primary-dark mb-3">A</div>
          <h1 class="text-white text-2xl font-bold">Crear cuenta de paciente</h1>
        </div>

        <div class="card">
          <div *ngIf="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {{ error }}
          </div>

          <form (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label class="label-field">Nombre</label>
                <input class="input-field" name="nombre" [(ngModel)]="form.nombre" required />
              </div>
              <div>
                <label class="label-field">Apellido</label>
                <input class="input-field" name="apellido" [(ngModel)]="form.apellido" required />
              </div>
            </div>
            <div class="mb-4">
              <label class="label-field">Correo electronico</label>
              <input class="input-field" type="email" name="correo" [(ngModel)]="form.correo" required />
            </div>
            <div class="mb-4">
              <label class="label-field">Telefono</label>
              <input class="input-field" name="telefono" [(ngModel)]="form.telefono" />
            </div>
            <div class="mb-6">
              <label class="label-field">Contrasena (minimo 6 caracteres)</label>
              <input class="input-field" type="password" name="password" minlength="6" [(ngModel)]="form.password" required />
            </div>
            <button type="submit" class="btn-primary w-full" [disabled]="cargando">
              {{ cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="text-sm text-gray-600 text-center mt-5">
            Ya tienes cuenta?
            <a routerLink="/login" class="text-primary font-medium hover:underline">Inicia sesion</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegistroComponent {
  form = { nombre: '', apellido: '', correo: '', telefono: '', password: '' };
  error = '';
  cargando = false;

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}

  async onSubmit() {
    this.error = '';
    this.cargando = true;
    try {
      const usuario = await this.auth.registroAsync(this.form);
      // Crea el perfil de Paciente vinculado al usuario recien creado
      this.router.navigateByUrl(this.auth.homeParaRol(usuario.rol));
    } catch (e: any) {
      this.error = e?.error?.error ?? 'No se pudo completar el registro';
    } finally {
      this.cargando = false;
    }
  }
}
