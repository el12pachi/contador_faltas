# Configuración de Variables de Entorno

Para que la aplicación funcione correctamente, necesitas crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

## Archivo .env.local

```bash
# Variables de entorno para la base de datos LibSQL/Turso
TURSO_DATABASE_URL=your_database_url_here
TURSO_AUTH_TOKEN=your_auth_token_here

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth (si usas Google para autenticación)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Pasos para configurar:

1. **Crear el archivo `.env.local`** en la raíz del proyecto (mismo nivel que `package.json`)

2. **Obtener las credenciales de Turso/LibSQL:**
   - Ve a [Turso](https://turso.tech/)
   - Crea una cuenta y una base de datos
   - Copia la URL de la base de datos y el token de autenticación

3. **Configurar NextAuth:**
   - Genera un secreto seguro para `NEXTAUTH_SECRET`
   - Si usas Google OAuth, configura las credenciales en Google Cloud Console

4. **Reemplazar los valores:**
   - Cambia `your_database_url_here` por tu URL real de Turso
   - Cambia `your_auth_token_here` por tu token real de Turso
   - Cambia `your_nextauth_secret_here` por un secreto seguro
   - Configura las credenciales de Google si las usas

## Ejemplo de valores reales:

```bash
TURSO_DATABASE_URL=libsql://tu-base-de-datos.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=mi-secreto-super-seguro-de-32-caracteres
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret
```

## Configurar la base de datos

Una vez que tengas las credenciales de Turso configuradas, necesitas crear la tabla `Usuario` en tu base de datos. Puedes ejecutar el siguiente SQL en tu base de datos Turso:

```sql
CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    urlLogo TEXT,
    token TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Una vez configurado el archivo `.env.local`, reinicia el servidor de desarrollo con `npm run dev`.

