# ClassTrack

Aplicacion web privada para registrar clases particulares, cobros, pagos y saldos por alumno.

## Stack

- `Node.js` + `Express`
- `EJS`
- `PostgreSQL` en `Supabase`
- Deploy preparado para `Vercel`

## Funcionalidad Actual

- Login simple con contrasena.
- Dashboard con totales y resumen mensual.
- CRUD de alumnos.
- Detalle de alumno con saldo, clases, pagos y calendario.
- CRUD de clases con cobro automatico o manual.
- CRUD de pagos con metodo `transferencia` o `efectivo`.
- Filtros por alumno y fecha en clases y pagos.
- UI responsive para escritorio y celular.

## Variables de Entorno

Crear `.env` local desde `.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
ADMIN_PASSWORD=tu-contrasena
SESSION_SECRET=un-secreto-largo-y-aleatorio
```

En desarrollo, si `ADMIN_PASSWORD` no existe, la app permite entrar con `admin`.
En produccion, `ADMIN_PASSWORD` y `SESSION_SECRET` son obligatorias.

## Base de Datos

Ejecutar `src/db/schema.sql` en Supabase.

Si tu base ya existia antes de `parent_name`, ejecutar:

```sql
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_name TEXT;
```

## Arranque Local

```powershell
npm install
npm run dev
```

Luego abrir:

```text
http://localhost:3000
```

## Deploy en Vercel

1. Subir el repo a GitHub.
2. Crear un proyecto nuevo en Vercel conectado al repo.
3. Configurar variables de entorno en Vercel:
   `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `NODE_ENV=production`.
4. Deploy.

Notas:
- Vercel entra por `api/index.js`, que exporta la app Express desde `src/app.js`.
- `vercel.json` incluye `src/views/**` para que EJS pueda renderizar en serverless.
- Los assets estan en `public/`, que Vercel sirve como archivos estaticos.
- No subir `.env` ni `.vercel/`.

## Diagnostico en Produccion

Despues de iniciar sesion, abre:

```text
/health/db
```

Respuesta esperada:

```json
{
  "ok": true,
  "databaseUrl": "supabase-pooler",
  "checks": {
    "students_table": true,
    "lessons_table": true,
    "payments_table": true,
    "parent_name_column": true
  }
}
```

Si `databaseUrl` dice `supabase-direct` y falla en Vercel, cambia `DATABASE_URL` por la URL del pooler de Supabase. La conexion directa de Supabase puede requerir IPv6; el pooler es la opcion compatible para entornos que necesitan IPv4.

## Pendiente Opcional

- Rotar credenciales de Supabase si alguna vez se subieron a GitHub.
- Tests automatizados.
- Exportacion CSV/Excel.
- Reportes mas avanzados.
