# AmatiClinic — Parte 3 de 4: Catálogos, seguros y experiencia del paciente

Sistema de gestión de citas médicas. Backend NestJS 10 + TypeORM, frontend Angular 17 + Tailwind, PostgreSQL 16 en Docker.

Rama de GitHub de esta parte: **`parte-3-catalogos-seguros`**

| Parte | Rama | Contenido |
|---|---|---|
| 1 | `parte-1-nucleo` | Núcleo de citas |
| 2 | `parte-2-farmacia` | Farmacia y receta electrónica |
| 3 (esta) | `parte-3-catalogos-seguros` | Catálogos, seguros y experiencia del paciente |
| 4 | `parte-4-operacion-clinica` | Operación clínica: lotes, emergencias y paneles |

Cada parte es el proyecto completo y funcional hasta esa etapa, y las partes se suben en orden (1, 2, 3, 4).

## Qué agrega esta parte

Agrega las primeras recomendaciones del ingeniero.

| Mejora | Qué hace | Dónde |
|---|---|---|
| Landing page | Página pública con especialidades y precios, días de atención de cada médico y seguros | `frontend/src/app/pages/landing` y `backend/src/publico` |
| Especialidad = catálogo | Tabla `especialidad` con precio de consulta; Recepción > Catálogos | `backend/src/catalogos`, `pages/recepcionista/catalogos.component.ts` |
| Seguros y descuentos | Tabla `seguro` con % de descuento; al agendar se calcula costo, descuento y total | `backend/src/catalogos`, `backend/src/citas` |
| Días disponibles por médico | Agendar: elige especialidad, médico, día en un calendario (solo los días que atiende) y un espacio libre de 30 min | `backend/src/horarios`, `pages/paciente/agendar-cita.component.ts` |
| Interceptores | Frontend: token, barra de carga y errores con avisos. Backend: bitácora de peticiones y límite de 15 s | `frontend/src/app/core/interceptors`, `backend/src/common/interceptors` |

Al arrancar, el backend vincula los médicos existentes al catálogo y calcula el costo de las citas que ya había.
El % de descuento en medicamentos de cada seguro se guarda desde ya, pero se cobra en farmacia a partir de la parte 4.

**Datos de prueba:** `db/seed-catalogos.sql` (precios de especialidades, 5 seguros ficticios asignados a pacientes)

## Cómo subirla a GitHub

Esta parte va encima de la parte 2 (`parte-2-farmacia`). Espera a que esa rama esté unida a `main`.

1. Acepta la invitación del repositorio que te llegó por correo y clónalo (solo la primera vez):

        git clone https://github.com/USUARIO/REPOSITORIO.git
        cd REPOSITORIO

2. Trae lo último de `main` y crea tu rama:

        git checkout main
        git pull
        git checkout -b parte-3-catalogos-seguros

3. Copia **el contenido** de la carpeta `amaticlinic` de este zip (no la carpeta) dentro de `REPOSITORIO` y acepta **reemplazar** los archivos.
   Este zip trae el proyecto completo hasta la parte 3, así que git solo marcará como cambios lo que agrega esta parte (`git status` para verlo).
4. Sube la rama:

        git add -A
        git commit -m "Parte 3: catálogos, seguros y experiencia del paciente"
        git push -u origin parte-3-catalogos-seguros

5. En GitHub abre un **Pull Request** de `parte-3-catalogos-seguros` hacia `main` y haz **Merge**.

Si no quieren esperar el merge anterior, crea tu rama desde la del compañero: `git fetch` y luego `git checkout -b parte-3-catalogos-seguros origin/parte-2-farmacia`. En ese caso el Pull Request se une a `main` después del de la parte 2.

`node_modules`, `dist` y `backend/.env` no se suben (están en `.gitignore`). Cada quien crea su propio `backend/.env` a partir de `backend/.env.example`.

## Cómo ejecutarla

Requisitos: Node.js 18 o 20 y Docker Desktop.

### 1. Base de datos
Desde esta carpeta:

    docker compose up -d

Si ya tienes un contenedor llamado `amaticlinic-postgres`, usa `docker start amaticlinic-postgres` en lugar de lo anterior.

Si el backend falla con `schema "citas_medicas" does not exist` (base nueva):

    docker exec -it amaticlinic-postgres psql -U postgres -d citas_medicas -c "CREATE SCHEMA IF NOT EXISTS citas_medicas;"

### 2. Backend (http://localhost:8080)

    cd backend
    copy .env.example .env
    npm install
    npm run start:dev

La primera vez TypeORM crea las tablas. Ajusta `DB_PASSWORD` en `.env` si tu contenedor usa otra contraseña.

### 3. Datos de prueba (con el backend ya iniciado), en este orden
CMD, desde esta carpeta:

    docker exec -i amaticlinic-postgres psql -U postgres -d citas_medicas < db\seed-usuarios.sql
    docker exec -i amaticlinic-postgres psql -U postgres -d citas_medicas < db\seed-farmacia.sql
    docker exec -i amaticlinic-postgres psql -U postgres -d citas_medicas < db\seed-demo.sql
    docker exec -i amaticlinic-postgres psql -U postgres -d citas_medicas < db\seed-catalogos.sql

(En PowerShell: `Get-Content db/seed-usuarios.sql | docker exec -i amaticlinic-postgres psql -U postgres -d citas_medicas`)

Los scripts se pueden ejecutar más de una vez sin duplicar datos.

Usuarios (contraseña `admin123` para todos):

| Rol | Correo |
|---|---|
| Recepcionista | admin@amaticlinic.com |
| Médico (Medicina General) | dr.lopez@amaticlinic.com |
| Médica (Medicina Interna) | dra.figueroa@amaticlinic.com |
| Paciente (alérgico a penicilina, con seguro) | juan.garcia@correo.com |
| Paciente (con seguro) | fernando.ortiz@correo.com |
| Farmacéutica | farmacia@amaticlinic.com |

### 4. Frontend (http://localhost:4200)

    cd frontend
    npm install
    npm start

La página de inicio (http://localhost:4200) es pública; desde ahí se inicia sesión o se crea una cuenta.

## Roles
Recepcionista, Médico, Paciente y Farmacéutico.

Los cambios están marcados en el código con comentarios entre corchetes, por ejemplo `[Farmacia]`, `[Agenda]`, `[Catalogo]`, `[Seguros]`, `[Lotes]` o `[Emergencias]`.
