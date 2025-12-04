import { createClient } from "@libsql/client";
import { createHash } from "crypto";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function getUser(email) {
  try {
    const result = await turso.execute(`SELECT * FROM Usuario WHERE email = ?`, [email]);
    const rows = Array.isArray(result.rows) ? result.rows : [];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return null;
  }
}

export async function createUser(datos) {
  try {
    const token = createHash('sha256').update((datos.id || '') + datos.email + new Date().getTime()).digest('hex');
    await turso.execute(`INSERT INTO Usuario (email, nombre, urlLogo, token) VALUES (?, ?, ?, ?)`, [
      datos.email, 
      datos.name || datos.nombre || 'Usuario', 
      datos.image || datos.urlLogo || null, 
      token
    ]);

    // Obtener el usuario recién creado
    const result = await turso.execute(`SELECT * FROM Usuario WHERE email = ?`, [datos.email]);
    const rows = Array.isArray(result.rows) ? result.rows : [];
    if (rows.length === 0) {
      console.error("Error: Usuario creado pero no se pudo recuperar");
      return false;
    }
    
    return rows[0];
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    return false;
  }
}

export async function loginUser(email, datos) {
  try {
    const result = await turso.execute(`SELECT * FROM Usuario WHERE email = ?`, [email]);
    const rows = Array.isArray(result.rows) ? result.rows : [];
    let user = null;
    
    if (rows.length === 0) {
      // Usuario no existe, crearlo
      user = await createUser(datos);
      if (!user) {
        console.error("Error: No se pudo crear el usuario");
        return false;
      }
    } else {
      // Usuario existe
      user = rows[0];
    }
    
    // Actualizar la foto de perfil si ha cambiado
    if (datos.image && (!user.urlLogo || user.urlLogo !== datos.image)) {
      await turso.execute(`UPDATE Usuario SET urlLogo = ? WHERE email = ?`, [datos.image, email]);
      user.urlLogo = datos.image;
    }
    
    return user;
  } catch (error) {
    console.error("Error en loginUser:", error);
    return false;
  }
}

// Función para asegurar que la tabla enrollments tenga la estructura correcta
async function ensureEnrollmentsStructure() {
  try {
    const { rows: tableInfo } = await turso.execute(`PRAGMA table_info(enrollments)`);
    const hasUsuarioToken = tableInfo.some(col => col.name === 'usuario_token');
    const hasUserId = tableInfo.some(col => col.name === 'user_id');

    if (tableInfo.length === 0) {
      // Tabla no existe, crearla con la estructura correcta
      await turso.execute(`
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
        )
      `);
      console.log("✅ Tabla 'enrollments' creada con 'usuario_token'");
    } else if (hasUserId && !hasUsuarioToken) {
      // Tabla existe con estructura antigua 'user_id', migrarla
      console.log("🔄 Migrando tabla 'enrollments' de 'user_id' a 'usuario_token'...");
      await turso.execute(`
        CREATE TABLE enrollments_new (
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
        )
      `);
      await turso.execute(`DROP TABLE enrollments`);
      await turso.execute(`ALTER TABLE enrollments_new RENAME TO enrollments`);
      console.log("✅ Migración de tabla 'enrollments' completada exitosamente");
    } else if (!hasUsuarioToken) {
      // La tabla existe pero no tiene la columna esperada
      console.warn("⚠️ Estructura de tabla 'enrollments' inesperada. Recreando...");
      await turso.execute(`DROP TABLE IF EXISTS enrollments`);
      await turso.execute(`
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
        )
      `);
      console.log("✅ Tabla 'enrollments' recreada con 'usuario_token'");
    }
  } catch (error) {
    console.error("❌ Error al asegurar la estructura de la tabla 'enrollments':", error);
  }
}

// Inicializar cursos si la tabla está vacía
export async function initializeCourses() {
  try {
    const { rows } = await turso.execute(`SELECT COUNT(*) as count FROM courses`);
    if (rows[0].count === 0) {
      await turso.execute(`
        INSERT OR IGNORE INTO courses (code, name, year_level, description, active) VALUES
        ('DAM1', '1º DAM', 1, 'Primer año del ciclo, fundamentos de programación y sistemas.', 1),
        ('DAM2', '2º DAM', 2, 'Segundo año, especialización en desarrollo de aplicaciones.', 1)
      `);
      console.log("✅ Cursos inicializados");
    }
  } catch (error) {
    console.error("Error al inicializar cursos:", error);
  }
}

// Inicializar módulos si la tabla está vacía
export async function initializeModules() {
  try {
    const { rows } = await turso.execute(`SELECT COUNT(*) as count FROM modules`);
    if (rows[0].count === 0) {
      await turso.execute(`
        INSERT OR IGNORE INTO modules (course_id, module_code, name, total_hours, weekly_hours, color) VALUES
        (1, '0483', 'Sistemas informáticos', 167, 5, 'from-purple-500 via-indigo-500 to-blue-500'),
        (1, '0484', 'Bases de Datos', 200, 6, 'from-emerald-400 via-teal-500 to-cyan-500'),
        (1, '0485', 'Programación', 267, 8, 'from-amber-400 via-orange-500 to-red-500'),
        (1, '0373', 'Lenguajes de marcas y sistemas de gestión de información', 67, 2, 'from-rose-400 via-pink-500 to-fuchsia-500'),
        (1, '0487', 'Entornos de desarrollo', 100, 3, 'from-violet-500 via-purple-500 to-indigo-500'),
        (1, '1709', 'Itinerario personal para la empleabilidad I', 100, 3, 'from-blue-400 via-cyan-500 to-teal-500'),
        (1, '1665', 'Digitalización aplicada a los sectores productivos (GS)', 33, 1, 'from-cyan-400 via-blue-500 to-indigo-500'),
        (1, '0179', 'Inglés profesional', 67, 2, 'from-fuchsia-400 via-pink-500 to-rose-500'),
        (2, '0486', 'Acceso a datos', 167, 5, 'from-sky-400 via-blue-500 to-indigo-500'),
        (2, '0488', 'Desarrollo de interfaces', 167, 5, 'from-emerald-500 via-green-500 to-teal-500'),
        (2, '0489', 'Programación multimedia y dispositivos móviles', 200, 6, 'from-amber-500 via-orange-500 to-red-500'),
        (2, '0490', 'Programación de servicios y procesos', 67, 2, 'from-rose-500 via-pink-500 to-fuchsia-500'),
        (2, '0491', 'Sistemas de gestión empresarial', 133, 4, 'from-indigo-500 via-violet-500 to-purple-500'),
        (2, '0492', 'Proyecto intermodular de desarrollo de aplicaciones multiplataforma', 67, 2, 'from-teal-500 via-emerald-500 to-green-500'),
        (2, '1710', 'Itinerario personal para la empleabilidad II', 67, 2, 'from-blue-500 via-sky-500 to-cyan-500'),
        (2, '1708', 'Sostenibilidad aplicada al sistema productivo', 33, 1, 'from-lime-500 via-green-500 to-emerald-500'),
        (2, 'OPT', 'Módulo profesional optativo', 100, 3, 'from-slate-500 via-slate-400 to-slate-300')
      `);
      console.log("✅ Módulos inicializados");
    }
  } catch (error) {
    console.error("Error al inicializar módulos:", error);
  }
}

// Obtener todos los cursos activos
export async function getCourses() {
  try {
    await ensureEnrollmentsStructure();
    await initializeCourses();
    const { rows } = await turso.execute(`SELECT * FROM courses WHERE active = 1 ORDER BY year_level`);
    return JSON.parse(JSON.stringify(rows));
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return [];
  }
}

// Obtener módulos de un curso específico
export async function getModulesByCourse(courseId) {
  try {
    await ensureEnrollmentsStructure();
    await initializeModules();
    const { rows } = await turso.execute(`
      SELECT * FROM modules 
      WHERE course_id = ? AND active = 1 
      ORDER BY module_code
    `, [courseId]);
    return JSON.parse(JSON.stringify(rows));
  } catch (error) {
    console.error("Error al obtener módulos:", error);
    return [];
  }
}

// Obtener faltas de un módulo específico para un usuario
export async function getAbsencesForModule(usuarioToken, moduleId) {
  try {
    await ensureEnrollmentsStructure();
    const { rows } = await turso.execute(`
      SELECT current_absences 
      FROM enrollments 
      WHERE usuario_token = ? AND module_id = ?
    `, [usuarioToken, moduleId]);
    
    if (rows.length === 0) {
      // Crear enrollment si no existe
      await turso.execute(`
        INSERT INTO enrollments (usuario_token, module_id, academic_year, current_absences)
        VALUES (?, ?, '2024-2025', 0)
      `, [usuarioToken, moduleId]);
      return 0;
    }
    
    return rows[0].current_absences || 0;
  } catch (error) {
    console.error("Error al obtener faltas del módulo:", error);
    return 0;
  }
}

// Agregar una falta
export async function addAbsence(usuarioToken, moduleId) {
  try {
    await ensureEnrollmentsStructure();
    
    // Verificar si existe el enrollment
    let { rows } = await turso.execute(`
      SELECT id, current_absences 
      FROM enrollments 
      WHERE usuario_token = ? AND module_id = ?
    `, [usuarioToken, moduleId]);
    
    let enrollmentId;
    
    if (rows.length === 0) {
      // Crear enrollment si no existe
      const result = await turso.execute(`
        INSERT INTO enrollments (usuario_token, module_id, academic_year, current_absences)
        VALUES (?, ?, '2024-2025', 1)
      `, [usuarioToken, moduleId]);
      
      // Obtener el ID del enrollment recién creado
      const newRows = await turso.execute(`
        SELECT id FROM enrollments 
        WHERE usuario_token = ? AND module_id = ?
      `, [usuarioToken, moduleId]);
      enrollmentId = newRows.rows[0].id;
    } else {
      enrollmentId = rows[0].id;
      // Actualizar contador
      await turso.execute(`
        UPDATE enrollments 
        SET current_absences = current_absences + 1 
        WHERE usuario_token = ? AND module_id = ?
      `, [usuarioToken, moduleId]);
    }
    
    // Registrar en el log
    await turso.execute(`
      INSERT INTO absence_log (enrollment_id, absence_date, hours_missed)
      VALUES (?, date('now'), 1)
    `, [enrollmentId]);
    
    return true;
  } catch (error) {
    console.error("Error al agregar falta:", error);
    return false;
  }
}

// Quitar una falta
export async function removeAbsence(usuarioToken, moduleId) {
  try {
    await ensureEnrollmentsStructure();
    
    const { rows } = await turso.execute(`
      SELECT id, current_absences 
      FROM enrollments 
      WHERE usuario_token = ? AND module_id = ?
    `, [usuarioToken, moduleId]);
    
    if (rows.length === 0 || rows[0].current_absences <= 0) {
      return false;
    }
    
    // Actualizar contador
    await turso.execute(`
      UPDATE enrollments 
      SET current_absences = current_absences - 1 
      WHERE usuario_token = ? AND module_id = ? AND current_absences > 0
    `, [usuarioToken, moduleId]);
    
    // Eliminar el último log
    await turso.execute(`
      DELETE FROM absence_log 
      WHERE enrollment_id = ? 
      AND id = (SELECT id FROM absence_log WHERE enrollment_id = ? ORDER BY absence_date DESC, id DESC LIMIT 1)
    `, [rows[0].id, rows[0].id]);
    
    return true;
  } catch (error) {
    console.error("Error al quitar falta:", error);
    return false;
  }
}

// Obtener todas las faltas de un usuario
export async function getAllAbsences(usuarioToken) {
  try {
    await ensureEnrollmentsStructure();
    const { rows } = await turso.execute(`
      SELECT module_id, current_absences 
      FROM enrollments 
      WHERE usuario_token = ?
    `, [usuarioToken]);
    
    const absences = {};
    rows.forEach(row => {
      absences[row.module_id] = row.current_absences || 0;
    });
    
    return absences;
  } catch (error) {
    console.error("Error al obtener todas las faltas:", error);
    return {};
  }
}

