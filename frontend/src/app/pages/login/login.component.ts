import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-primary-dark px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <div class="w-14 h-14 mx-auto rounded-full bg-accent flex items-center justify-center font-bold text-2xl text-primary-dark mb-3">A</div>
          <h1 class="text-white text-2xl font-bold">AmatiClinic</h1>
          <p class="text-white/70 text-sm">Sistema de Gestion de Citas Medicas</p>
        </div>

        <div class="card">
          <h2 class="text-lg font-semibold mb-4 text-gray-800">Iniciar sesion</h2>

          <div *ngIf="error" class="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {{ error }}
          </div>

          <form (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <label class="label-field">Correo electronico</label>
              <input class="input-field" type="email" name="correo" [(ngModel)]="correo" required />
            </div>
            <div class="mb-6">
              <label class="label-field">Contrasena</label>
              <input class="input-field" type="password" name="password" [(ngModel)]="password" required />
            </div>
            <button type="submit" class="btn-primary w-full" [disabled]="cargando">
              {{ cargando ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </form>

          <p class="text-sm text-gray-600 text-center mt-5">
            No tienes cuenta?
            <a routerLink="/registro" class="text-primary font-medium hover:underline">Registrate como paciente</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  correo = '';
  password = '';
  error = '';
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.error = '';
    this.cargando = true;
    try {
      const usuario = await this.auth.loginAsync(this.correo, this.password);
      this.router.navigateByUrl(this.auth.homeParaRol(usuario.rol));
    } catch (e: any) {
      this.error = e?.error?.error ?? 'Credenciales invalidas';
    } finally {
      this.cargando = false;
    }
  }
}
