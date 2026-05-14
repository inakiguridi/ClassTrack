# ClassTrack

ClassTrack es una aplicacion web privada para registrar clases particulares, cobros, pagos y saldos por alumno.

Acceso web: https://classtrack-ig.vercel.app

## Que Permite Hacer

- Iniciar sesion con contrasena de administrador.
- Registrar alumnos con nombre, nombre del padre/apoderado y tarifa por hora.
- Registrar clases realizadas por alumno.
- Calcular cobros automaticamente segun duracion y tarifa del alumno.
- Definir cobros manuales cuando una clase tenga un valor especial.
- Registrar pagos por alumno.
- Clasificar pagos como `transferencia` o `efectivo`.
- Ver deuda general y deuda por alumno.
- Filtrar clases y pagos por alumno y fecha.
- Revisar el detalle de cada alumno con historial de clases, pagos, saldo y calendario.
- Editar y eliminar alumnos, clases y pagos.
- Ver analytics con estadisticas generales, mensuales, por alumno, por duracion y por metodo de pago.
- Exportar informacion en CSV.

## Stack

- `Node.js` >= 20
- `Express`
- `EJS`
- `PostgreSQL` en `Supabase`
- `Vercel` para hosting web

## Estructura Principal

```text
api/
  index.js              # Entrada serverless para Vercel
public/
  styles.css            # Estilos globales
  *.js                  # Scripts del frontend
src/
  app.js                # Configuracion principal de Express
  server.js             # Arranque local
  db/                   # Conexion, schema y repositorios SQL
  middleware/           # Middleware de autenticacion
  routes/               # Rutas de la aplicacion
  utils/                # Utilidades compartidas
  views/                # Vistas EJS
```

## Variables de Entorno

Para desarrollo local, crear un archivo `.env` basado en `.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
ADMIN_PASSWORD=tu-contrasena
SESSION_SECRET=un-secreto-largo-y-aleatorio
```

Notas:

- En desarrollo, si `ADMIN_PASSWORD` no existe, la app permite entrar con `admin`.
- En produccion, `ADMIN_PASSWORD` y `SESSION_SECRET` son obligatorias.
- `DATABASE_URL` debe apuntar a la base de datos de Supabase.
- No subir `.env` al repositorio.

## Base de Datos

El schema inicial esta en:

```text
src/db/schema.sql
```

Tablas principales:

- `students`: alumnos, tarifa por hora y datos basicos.
- `lessons`: clases realizadas, duracion y monto cobrado.
- `payments`: pagos recibidos, monto, metodo y fecha.

Relaciones principales:

- Un alumno puede tener muchas clases.
- Un alumno puede tener muchos pagos.
- Cada clase y cada pago pertenece a un alumno.

## Arranque Local

Instalar dependencias:

```powershell
npm install
```

Levantar el servidor local:

```powershell
npm run dev
```

Abrir:

```text
http://localhost:3000
```

## Scripts

```powershell
npm run dev
```

Inicia la app local con recarga automatica de Node.

```powershell
npm start
```

Inicia la app local sin modo watch.

## Rutas Utiles

- `/`: dashboard principal.
- `/students`: alumnos.
- `/lessons`: clases.
- `/payments`: pagos.
- `/analytics`: estadisticas y reportes.
- `/health/db`: diagnostico de conexion a base de datos, disponible despues de iniciar sesion.

## Estado Actual

La aplicacion ya esta preparada para funcionar en web mediante Vercel y Supabase. El flujo principal de V1 esta implementado: alumnos, clases, pagos, saldos, filtros, calendario, analytics, exportacion y login simple.

## Ideas Futuras

- Login multiusuario.
- Recuperacion de contrasena.
- Tests automatizados.
- Exportacion Excel ademas de CSV.
- Graficos visuales en analytics.
- Notas por alumno o por clase.
- Recordatorios de pagos pendientes.
