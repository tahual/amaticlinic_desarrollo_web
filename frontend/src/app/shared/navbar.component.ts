import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-primary-dark text-white sticky top-0 z-10 no-print">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-primary-dark">A</div>
          <span class="font-semibold tracking-wide">AmatiClinic</span>
        </div>
        <nav class="hidden md:flex items-center gap-1">
          <a *ngFor="let link of links()" [routerLink]="link.path" routerLinkActive="bg-white/15"
             class="px-3 py-1.5 rounded-md text-sm hover:bg-white/10 transition">
            {{ link.label }}
          </a>
        </nav>
        <div class="flex items-center gap-3">
          <span class="hidden sm:block text-sm text-white/80">{{ auth.user()?.nombre }} · {{ auth.user()?.rol }}</span>
          <button (click)="auth.logout()" class="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition">
            Salir
          </button>
        </div>
      </div>
      <nav class="md:hidden flex overflow-x-auto gap-1 px-4 pb-2">
        <a *ngFor="let link of links()" [routerLink]="link.path" routerLinkActive="bg-white/15"
           class="px-3 py-1.5 rounded-md text-xs whitespace-nowrap hover:bg-white/10 transition">
          {{ link.label }}
        </a>
      </nav>
    </header>
  `,
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}

  links = computed<NavLink[]>(() => {
    const rol = this.auth.user()?.rol;
    if (rol === 'Paciente') {
      return [
        { path: '/paciente/dashboard', label: 'Inicio' },
        { path: '/paciente/agendar', label: 'Agendar cita' },
        { path: '/paciente/mis-citas', label: 'Mis citas' },
        { path: '/paciente/medicos', label: 'Medicos' },
      ];
    }
    if (rol === 'Medico') {
      return [
        { path: '/medico/dashboard', label: 'Inicio' },
        { path: '/medico/citas', label: 'Mi agenda' },
        { path: '/medico/pacientes', label: 'Pacientes' },
        { path: '/medico/historial', label: 'Historial' },
      ];
    }
    if (rol === 'Recepcionista') {
      return [
        { path: '/recepcionista/dashboard', label: 'Inicio' },
        { path: '/recepcionista/citas', label: 'Citas' },
        { path: '/recepcionista/medicos', label: 'Medicos' },
        { path: '/recepcionista/horarios', label: 'Horarios' },
        { path: '/recepcionista/pacientes', label: 'Pacientes' },
      ];
    }
    return [];
  });
}
