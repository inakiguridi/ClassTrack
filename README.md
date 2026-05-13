# ClassTrack

Aplicacion web para registrar clases particulares, cobros y pagos por alumno.

## V1 Alcance

- Solo uso personal (sin login en esta version).
- Solo clases realizadas.
- Moneda unica: `CLP`.
- Deuda por alumno calculada como:
  `total_clases - total_pagos`.
- Pago aplicado a la deuda general del alumno (no a clases individuales).
- Responsive para uso en celular y escritorio.

## Stack V1 (simple para publicar gratis)

- Frontend + Backend: `Node.js` + `Express` + `EJS`
- Base de datos: `PostgreSQL` (hosteada gratis)
- Deploy app: `Render` (free tier)
- Deploy DB: `Supabase Postgres` (free tier)

## Modelo de Datos Minimo

### `students`

- `id` (uuid o serial)
- `name` (requerido)
- `hourly_rate` (entero CLP, requerido)
- `contact` (opcional)
- `notes` (opcional)
- `created_at`

### `lessons`

- `id`
- `student_id` (FK -> students.id)
- `lesson_date` (fecha)
- `duration_minutes` (requerido)
- `hourly_rate_snapshot` (entero CLP)
- `charge_mode` (`auto` o `manual`)
- `manual_amount` (entero CLP, nullable)
- `amount_charged` (entero CLP, requerido)
- `notes` (opcional)
- `created_at`

Regla:
- Si `charge_mode=auto`: `amount_charged = hourly_rate_snapshot * duration_minutes / 60`.
- Si `charge_mode=manual`: `amount_charged = manual_amount`.

### `payments`

- `id`
- `student_id` (FK -> students.id)
- `payment_date`
- `amount_paid` (entero CLP, requerido)
- `method` (opcional: transferencia, efectivo, etc.)
- `notes` (opcional)
- `created_at`

## Vistas Minimas de la App

- Dashboard:
  total cobrado, total pagado, total pendiente.
- Alumnos:
  listar, crear, editar tarifa por hora.
- Clases:
  registrar clase, calcular cobro automatico, opcion monto manual.
- Pagos:
  registrar pagos por alumno.
- Estado por alumno:
  total clases, total pagos, saldo pendiente.

## Seccion Web a Implementar (Hosting 100% web)

### 1) Base tecnica

- [ ] Inicializar proyecto `Node.js` con `Express` y `EJS`.
- [ ] Configurar variables de entorno (`.env`) para DB y puerto.
- [ ] Crear estructura inicial:
  `src/routes`, `src/views`, `src/public`, `src/db`.

### 2) Base de datos (Postgres)

- [ ] Crear proyecto en `Supabase`.
- [ ] Crear tablas `students`, `lessons`, `payments`.
- [ ] Agregar FKs, constraints y campos requeridos.
- [ ] Cargar datos de prueba minimos.

### 3) Funcionalidad V1

- [ ] CRUD basico de alumnos.
- [ ] Registrar clase con modo `auto/manual`.
- [ ] Registrar pagos.
- [ ] Calcular saldo por alumno en consultas (no guardarlo en columna fija).
- [ ] Mostrar dashboard con totales.

### 4) UI responsive

- [ ] Formularios simples y claros para celular.
- [ ] Tabla/listados legibles en mobile (cards o tabla adaptada).
- [ ] Validaciones de campos obligatorios y montos positivos.

### 5) Deploy web gratis

- [ ] Subir repositorio a GitHub.
- [ ] Crear servicio web en `Render`.
- [ ] Configurar `DATABASE_URL` de Supabase en Render.
- [ ] Ejecutar migraciones/schema en la DB productiva.
- [ ] Verificar app publicada desde celular y escritorio.

## V2 (cuando toque)

- Login/autenticacion.
- Exportacion CSV/Excel.
- Clases futuras/agendadas.

## Arranque Local

1. Instalar `Node.js` (incluye `npm`).
2. Instalar dependencias:
   `npm install`
3. Crear archivo `.env` desde `.env.example`.
4. Ejecutar en desarrollo:
   `npm run dev`
5. Abrir:
   `http://localhost:3000`
