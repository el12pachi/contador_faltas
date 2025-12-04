-- Script de migración para actualizar la tabla enrollments
-- Ejecuta este SQL en tu base de datos Turso

-- Paso 1: Verificar si existe la columna usuario_token
-- Si no existe, necesitamos migrar los datos

-- Opción 1: Si la tabla tiene user_id y quieres migrar a usuario_token
-- (Solo ejecuta esto si tienes datos en user_id que quieres preservar)

-- Crear tabla temporal con la nueva estructura
CREATE TABLE IF NOT EXISTS enrollments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_token TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2024-2025',
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'validated', 'failed')),
    current_absences INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_token) REFERENCES Usuario(token) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    UNIQUE(usuario_token, module_id, academic_year)
);

-- Si tienes datos antiguos que migrar, descomenta y adapta esto:
-- INSERT INTO enrollments_new (usuario_token, module_id, academic_year, status, current_absences, created_at)
-- SELECT u.token, e.module_id, e.academic_year, e.status, e.current_absences, e.created_at
-- FROM enrollments e
-- JOIN users u ON e.user_id = u.id
-- JOIN Usuario u2 ON u.email = u2.email;

-- Eliminar tabla antigua
-- DROP TABLE IF EXISTS enrollments;

-- Renombrar tabla nueva
-- ALTER TABLE enrollments_new RENAME TO enrollments;

-- Opción 2: Si prefieres empezar desde cero (más simple)
-- Simplemente elimina la tabla antigua y crea la nueva:
DROP TABLE IF EXISTS enrollments;

CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_token TEXT NOT NULL,
    module_id INTEGER NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2024-2025',
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'validated', 'failed')),
    current_absences INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_token) REFERENCES Usuario(token) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    UNIQUE(usuario_token, module_id, academic_year)
);

