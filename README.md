# AmatiClinic — Parte 1 de 4: Núcleo de citas

Sistema de gestión de citas médicas. Backend NestJS 10 + TypeORM, frontend Angular 17 + Tailwind, PostgreSQL 16 en Docker.

Rama de GitHub de esta parte: **`parte-1-nucleo`**

| Parte | Rama | Contenido |
|---|---|---|
| 1 (esta) | `parte-1-nucleo` | Núcleo de citas |
| 2 | `parte-2-farmacia` | Farmacia y receta electrónica |
| 3 | `parte-3-catalogos-seguros` | Catálogos, seguros y experiencia del paciente |
| 4 | `parte-4-operacion-clinica` | Operación clínica: lotes, emergencias y paneles |

Cada parte es el proyecto completo y funcional hasta esa etapa, y las partes se suben en orden (1, 2, 3, 4).

## Qué agrega esta parte

Es la base del sistema; las demás partes se construyen encima de esta.

**Backend (NestJS)**
- Autenticación con JWT y roles: Paciente, Médico y Recepcionista (`src/auth`, `src/common/guards`)
- Médicos, pacientes y horarios de atención (`src/medicos`, `src/pacientes`, `src/horarios`)
- Citas: agendar, cancelar, completar y reprogramar, validando el horario del médico (`src/citas`)
- Historial médico, notificaciones y estadísticas básicas (`src/historial`, `src/notificaciones`, `src/estadisticas`)
- Al registrarse, el paciente queda con su teléfono y correo en el perfil
- Zona horaria de Guatemala en la conexión a PostgreSQL

**Frontend (Angular)**
- Inicio de sesión y registro de pacientes
- Panel de cada rol
- Paciente: agendar cita, mis citas, médicos
- Médico: agenda en calendario (Mes, Semana, Lista) con filtro por fechas e impresión; pacientes e historial
- Recepción: citas, médicos, horarios y pacientes

**Datos de prueba:** `db/seed-usuarios.sql` y `db/fix-paciente-contacto.sql`

## Cómo subirla a GitHub

Tú creas el repositorio y subes la base. Los demás esperan a que esta parte esté en `main`.

1. En GitHub crea un repositorio vacío (sin README) y en **Settings > Collaborators** invita a tus 3 compañeros.
2. En tu computadora:

        git clone https://github.com/USUARIO/REPOSITORIO.git
        cd REPOSITORIO
        git commit --allow-empty -m "Inicio del proyecto"
        git branch -M main
        git push -u origin main
        git checkout -b parte-1-nucleo

3. Copia **el contenido** de la carpeta `amaticlinic` de este zip (no la carpeta) dentro de `REPOSITORIO`.
4. Sube la rama:

        git add -A
        git commit -m "Parte 1: nucleo de citas (auth, medicos, pacientes, horarios, citas, agenda)"
        git push -u origin parte-1-nucleo

5. En GitHub abre un **Pull Request** de `parte-1-nucleo` hacia `main` y haz **Merge**.

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
    docker exec -i amaticlinic-postgres psql -U postgres -d citas_medicas < db\fix-paciente-contacto.sql

(En PowerShell: `Get-Content db/seed-usuarios.sql | docker exec -i amaticlinic-postgres psql -U postgres -d citas_medicas`)

Los scripts se pueden ejecutar más de una vez sin duplicar datos.

Usuarios (contraseña `admin123` para todos):

| Rol | Correo |
|---|---|
| Recepcionista | admin@amaticlinic.com |
| Médico (Medicina General) | dr.lopez@amaticlinic.com |
| Médica (Pediatría) | dra.perez@amaticlinic.com |
| Paciente | juan.garcia@correo.com |
| Paciente | maria.hernandez@correo.com |

### 4. Frontend (http://localhost:4200)

    cd frontend
    npm install
    npm start

Abre http://localhost:4200 e inicia sesión con uno de los usuarios.

## Roles
Recepcionista, Médico y Paciente.

Los cambios están marcados en el código con comentarios entre corchetes, por ejemplo `[Farmacia]`, `[Agenda]`, `[Catalogo]`, `[Seguros]`, `[Lotes]` o `[Emergencias]`.
