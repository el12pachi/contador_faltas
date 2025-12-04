-- Base de datos SQLite para App Asistencia DAM
-- Compatible con SQLite 3.x

-- Habilitar foreign keys (requerido en SQLite)
PRAGMA foreign_keys = ON;

-- 0. Tabla de Usuario (para autenticación con NextAuth)
CREATE TABLE IF NOT EXISTS Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    urlLogo TEXT,
    token TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1. Tabla de Usuarios (Alumnos)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Cursos (Ej: DAM 1, DAM 2)
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE, -- Ej: "DAM1", "DAM2"
    name TEXT NOT NULL, -- Ej: "1º DAM"
    description TEXT,
    year_level INTEGER NOT NULL, -- 1 o 2
    active INTEGER DEFAULT 1 CHECK(active IN (0, 1)) -- 0 = inactivo, 1 = activo
);

-- 3. Tabla de Módulos (Asignaturas base)
CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    module_code TEXT NOT NULL, -- Ej: "0483", "0484"
    name TEXT NOT NULL, -- Ej: "Sistemas informáticos"
    total_hours INTEGER NOT NULL, -- Horas totales del curso
    weekly_hours INTEGER NOT NULL, -- Horas a la semana
    max_absences_percent REAL DEFAULT 15.00, -- Por defecto 15%
    color TEXT, -- Color para el gradiente (ej: "from-purple-500 via-indigo-500 to-blue-500")
    active INTEGER DEFAULT 1 CHECK(active IN (0, 1)), -- 0 = inactivo, 1 = activo
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(course_id, module_code) -- Evitar códigos duplicados en el mismo curso
);

-- 4. Tabla de Matrículas (Enrollments)
-- Vincula al usuario autenticado con los módulos específicos que cursa este año
CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_token TEXT NOT NULL, -- Token del usuario autenticado (de la tabla Usuario)
    module_id INTEGER NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2024-2025', -- Ej: "2024-2025"
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'validated', 'failed')),
    current_absences INTEGER DEFAULT 0, -- Contador rápido (cache) para la UI
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_token) REFERENCES Usuario(token) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    UNIQUE(usuario_token, module_id, academic_year) -- Evitar que un usuario se matricule dos veces del mismo módulo el mismo año
);

-- 5. Tabla de Historial de Faltas (Opcional para futuro detalle)
-- Permite ver en qué fecha exacta se faltó
CREATE TABLE IF NOT EXISTS absence_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL,
    absence_date DATE NOT NULL,
    hours_missed INTEGER DEFAULT 1, -- Cuantas horas de clase se perdieron ese día
    is_justified INTEGER DEFAULT 0 CHECK(is_justified IN (0, 1)), -- 0 = no justificada, 1 = justificada
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_module_id ON enrollments(module_id);
CREATE INDEX IF NOT EXISTS idx_absence_log_enrollment_id ON absence_log(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_absence_log_date ON absence_log(absence_date);

-- DATOS DE EJEMPLO (SEED DATA) --

-- Insertar Cursos
INSERT OR IGNORE INTO courses (code, name, year_level) VALUES 
('DAM1', '1º DAM', 1), 
('DAM2', '2º DAM', 2);

-- Insertar módulos de 1º DAM
INSERT OR IGNORE INTO modules (course_id, module_code, name, total_hours, weekly_hours, color) VALUES 
(1, '0483', 'Sistemas informáticos', 167, 5, 'from-purple-500 via-indigo-500 to-blue-500'),
(1, '0484', 'Bases de Datos', 200, 6, 'from-emerald-400 via-teal-500 to-cyan-500'),
(1, '0485', 'Programación', 267, 8, 'from-amber-400 via-orange-500 to-red-500'),
(1, '0373', 'Lenguajes de marcas y sistemas de gestión de información', 67, 2, 'from-rose-400 via-pink-500 to-fuchsia-500'),
(1, '0487', 'Entornos de desarrollo', 100, 3, 'from-violet-500 via-purple-500 to-indigo-500'),
(1, '1709', 'Itinerario personal para la empleabilidad I', 100, 3, 'from-blue-400 via-cyan-500 to-teal-500'),
(1, '1665', 'Digitalización aplicada a los sectores productivos (GS)', 33, 1, 'from-cyan-400 via-blue-500 to-indigo-500'),
(1, '0179', 'Inglés profesional', 67, 2, 'from-fuchsia-400 via-pink-500 to-rose-500');

-- Insertar módulos de 2º DAM
INSERT OR IGNORE INTO modules (course_id, module_code, name, total_hours, weekly_hours, color) VALUES 
(2, '0486', 'Acceso a datos', 167, 5, 'from-sky-400 via-blue-500 to-indigo-500'),
(2, '0488', 'Desarrollo de interfaces', 167, 5, 'from-emerald-500 via-green-500 to-teal-500'),
(2, '0489', 'Programación multimedia y dispositivos móviles', 200, 6, 'from-amber-500 via-orange-500 to-red-500'),
(2, '0490', 'Programación de servicios y procesos', 67, 2, 'from-rose-500 via-pink-500 to-fuchsia-500'),
(2, '0491', 'Sistemas de gestión empresarial', 133, 4, 'from-indigo-500 via-violet-500 to-purple-500'),
(2, '0492', 'Proyecto intermodular de desarrollo de aplicaciones multiplataforma', 67, 2, 'from-teal-500 via-emerald-500 to-green-500'),
(2, '1710', 'Itinerario personal para la empleabilidad II', 67, 2, 'from-blue-500 via-sky-500 to-cyan-500'),
(2, '1708', 'Sostenibilidad aplicada al sistema productivo', 33, 1, 'from-lime-500 via-green-500 to-emerald-500'),
(2, 'OPT', 'Módulo profesional optativo', 100, 3, 'from-slate-500 via-slate-400 to-slate-300');

-- Insertar un alumno de prueba
INSERT OR IGNORE INTO users (username, email) VALUES ('dev_student', 'alumno@dam.com');

-- Matricular al alumno de prueba en algunos módulos de 1º DAM
INSERT OR IGNORE INTO enrollments (user_id, module_id, academic_year) VALUES 
(1, 1, '2024-2025'), -- Programación
(1, 2, '2024-2025'), -- Bases de Datos
(1, 3, '2024-2025'); -- Sistemas informáticos
