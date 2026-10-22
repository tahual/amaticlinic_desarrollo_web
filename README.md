# AmatiClinic — Parte 2 de 4: Farmacia y receta electrónica

Sistema de gestión de citas médicas. Backend NestJS 10 + TypeORM, frontend Angular 17 + Tailwind, PostgreSQL 16 en Docker.

Rama de GitHub de esta parte: **`parte-2-farmacia`**

| Parte | Rama | Contenido |
|---|---|---|
| 1 | `parte-1-nucleo` | Núcleo de citas |
| 2 (esta) | `parte-2-farmacia` | Farmacia y receta electrónica |
| 3 | `parte-3-catalogos-seguros` | Catálogos, seguros y experiencia del paciente |
| 4 | `parte-4-operacion-clinica` | Operación clínica: lotes, emergencias y paneles |

Cada parte es el proyecto completo y funcional hasta esa etapa, y las partes se suben en orden (1, 2, 3, 4).

## Qué agrega esta parte

Agrega el módulo de farmacia sobre la parte 1.

**Backend**
- Nuevo rol **Farmacéutico** (`src/common/enums/tipo-usuario.enum.ts`)
- Catálogo de medicamentos e inventario con kardex: entradas, salidas y ajustes (`src/farmacia`)
- Receta electrónica ligada a la cita, con alerta de alergias del paciente
- Despacho total o parcial de recetas, anulación y resumen de farmacia

**Frontend**
- Farmacia: panel, despacho de recetas, inventario y movimientos (`src/app/pages/farmacia`)
- Médico: emitir receta desde la cita, lista de recetas con filtros por fecha y paciente, imprimir o guardar en PDF
- Paciente: mis recetas (también se pueden imprimir)

**Datos de prueba:** `db/seed-farmacia.sql` (farmacéutica y 12 medicamentos) y `db/seed-demo.sql` (más médicos, pacientes, citas, historial y recetas)

## Cómo subirla a GitHub

Esta parte va encima de la parte 1 (`parte-1-nucleo`). Espera a que esa rama esté unida a `main`.

1. Acepta la invitación del repositorio que te llegó por correo y clónalo (solo la primera vez):

        git clone https://github.com/USUARIO/REPOSITORIO.git
        cd REPOSITORIO

2. Trae lo último de `main` y crea tu rama:

        git checkout main
        git pull
        git checkout -b parte-2-farmacia

3. Copia **el contenido** de la carpeta `amaticlinic` de este zip (no la carpeta) dentro de `REPOSITORIO` y acepta **reemplazar** los archivos.
   Este zip trae el proyecto completo hasta la parte 2, así que git solo marcará como cambios lo que agrega esta parte (`git status` para verlo).
4. Sube la rama:

        git add -A
        git commit -m "Parte 2: farmacia y receta electrónica"
        git push -u origin parte-2-farmacia

5. En GitHub abre un **Pull Request** de `parte-2-farmacia` hacia `main` y haz **Merge**.

Si no quieren esperar el merge anterior, crea tu rama desde la del compañero: `git fetch` y luego `git checkout -b parte-2-farmacia origin/parte-1-nucleo`. En ese caso el Pull Request se une a `main` después del de la parte 1.

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

(En PowerShell: `Get-Content db/seed-usuarios.sql | docker exec -i amaticlinic-postgres psql -U postgres -d citas_medicas`)

Los scripts se pueden ejecutar más de una vez sin duplicar datos.

Usuarios (contraseña `admin123` para todos):

| Rol | Correo |
|---|---|
| Recepcionista | admin@amaticlinic.com |
| Médico (Medicina General) | dr.lopez@amaticlinic.com |
| Médica (Medicina Interna) | dra.figueroa@amaticlinic.com |
| Paciente (alérgico a penicilina) | juan.garcia@correo.com |
| Paciente | fernando.ortiz@correo.com |
| Farmacéutica | farmacia@amaticlinic.com |

### 4. Frontend (http://localhost:4200)

    cd frontend
    npm install
    npm start

Abre http://localhost:4200 e inicia sesión con uno de los usuarios.

## Roles
Recepcionista, Médico, Paciente y Farmacéutico.

Los cambios están marcados en el código con comentarios entre corchetes, por ejemplo `[Farmacia]`, `[Agenda]`, `[Catalogo]`, `[Seguros]`, `[Lotes]` o `[Emergencias]`.
