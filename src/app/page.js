'use client';

import { useState, useEffect } from 'react';
import Asignaturas from './components/asignaturas';
import Sidebar from './components/Sidebar';
import StatsPanel from './components/StatsPanel';
import { Menu } from 'lucide-react';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('home');
  const [memoria, setMemoria] = useState({});
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingModules, setLoadingModules] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.className = savedTheme;

    loadCourses();
  }, []);

  useEffect(() => {
    if (cursoSeleccionado) {
      setLoadingModules(true);
      loadModules(cursoSeleccionado);
      loadAbsences();
    }
  }, [cursoSeleccionado]);

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      if (data.courses) {
        const cursosConStats = await Promise.all(
          data.courses.map(async (c) => {
            try {
              // Cargar módulos de cada curso para calcular estadísticas
              const modulesResponse = await fetch(`/api/modules?courseId=${c.id}`);
              const modulesData = await modulesResponse.json();
              
              let horas = 0;
              let modulos = 0;
              
              if (modulesData.modules && modulesData.modules.length > 0) {
                modulos = modulesData.modules.length;
                horas = modulesData.modules.reduce((acc, m) => acc + (m.total_hours || 0), 0);
              }
              
              return {
                id: c.id,
                nombre: c.name,
                descripcion: c.description || '',
                horas: horas,
                modulos: modulos
              };
            } catch (error) {
              console.error(`Error al cargar módulos del curso ${c.id}:`, error);
              return {
                id: c.id,
                nombre: c.name,
                descripcion: c.description || '',
                horas: 0,
                modulos: 0
              };
            }
          })
        );
        
        setCursos(cursosConStats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      setLoading(false);
    }
  };

  const loadModules = async (courseId) => {
    try {
      setLoadingModules(true);
      const response = await fetch(`/api/modules?courseId=${courseId}`);
      const data = await response.json();
      if (data.modules) {
        const modules = data.modules.map(m => ({
          id: m.id,
          curso: m.course_id,
          nombre: `${m.module_code}. ${m.name}`,
          horas: m.total_hours,
          color: m.color || 'from-gray-500 via-gray-400 to-gray-300',
          module_code: m.module_code
        }));
        setAsignaturas(modules);

        // Actualizar estadísticas de cursos
        setCursos(prev => prev.map(c => {
          if (c.id === courseId) {
            const courseModules = modules.filter(m => m.curso === c.id);
            return {
              ...c,
              horas: courseModules.reduce((acc, m) => acc + m.horas, 0),
              modulos: courseModules.length
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error('Error al cargar módulos:', error);
    } finally {
      setLoadingModules(false);
    }
  };

  const loadAbsences = async () => {
    try {
      const response = await fetch('/api/absences');
      const data = await response.json();
      if (data.absences) {
        setMemoria(data.absences);
      }
    } catch (error) {
      console.error('Error al cargar faltas:', error);
    }
  };

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.className = newTheme;
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#000000] text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Sidebar - Siempre visible */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onThemeChange={handleThemeChange}
        currentView={currentView}
        onViewChange={setCurrentView}
        cursoSeleccionado={cursoSeleccionado}
        onCursoChange={setCursoSeleccionado}
        cursos={cursos}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content - Solo esta parte tiene scroll */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar - Only on mobile */}
        <div className={`lg:hidden flex-shrink-0 backdrop-blur-xl border-b px-4 py-3 transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-[#111827]/95 border-white/10'
            : 'bg-white/95 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area - Scroll solo aquí */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto w-full">
            {!cursoSeleccionado ? (
              // Pantalla de selección de curso
              <div className="w-full">
                {loading ? (
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                      <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
                        theme === 'dark' ? 'border-white' : 'border-gray-700'
                      }`}></div>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Cargando cursos...</p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto w-full">
                    <header className="mb-6 sm:mb-8">
                      <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Selecciona un curso</h1>
                      <p className={`text-xs sm:text-sm lg:text-base ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Elige el curso sobre el que quieres gestionar la asistencia.
                      </p>
                    </header>
                    
                    {/* Lista de cursos */}
                    <div className="space-y-3">
                      {cursos.map((curso) => (
                        <button
                          key={curso.id}
                          type="button"
                          onClick={() => setCursoSeleccionado(curso.id)}
                          className={`w-full rounded-xl px-4 sm:px-6 py-4 sm:py-5 text-left transition-all border group ${
                            theme === 'dark'
                              ? 'glass-card hover:bg-white/[0.08] border-white/10 hover:border-white/20'
                              : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {curso.nombre}
                              </h2>
                              <p className={`text-xs sm:text-sm mb-3 line-clamp-2 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {curso.descripcion}
                              </p>
                              <div className={`flex flex-wrap items-center gap-3 sm:gap-4 text-xs ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                  {curso.modulos} módulos
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  {curso.horas} horas
                                </span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 self-start sm:self-auto">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center transition-all ${
                                theme === 'dark'
                                  ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30 group-hover:from-blue-500/30 group-hover:to-indigo-500/30'
                                  : 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300 group-hover:from-blue-200 group-hover:to-indigo-200'
                              }`}>
                                <span className={`text-lg sm:text-xl font-bold ${
                                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                }`}>
                                  {curso.id}º
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : loadingModules ? (
              // Loading screen cuando se carga un curso
              <div className="w-full flex items-center justify-center min-h-[60vh]">
                <div className={`max-w-md w-full mx-auto p-8 rounded-2xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'glass-card border border-white/10'
                    : 'bg-white border border-gray-200 shadow-lg'
                }`}>
                  <div className="text-center">
                    {/* Spinner animado */}
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className={`absolute inset-0 rounded-full border-4 ${
                        theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                      }`}></div>
                      <div className={`absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin`}></div>
                      <div className={`absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    
                    {/* Texto de carga */}
                    <h3 className={`text-xl font-semibold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Cargando curso
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Preparando las asignaturas...
                    </p>
                    
                    {/* Puntos animados */}
                    <div className="flex justify-center gap-1 mt-4">
                      <div className={`w-2 h-2 rounded-full ${
                        theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                      } animate-bounce`} style={{ animationDelay: '0s' }}></div>
                      <div className={`w-2 h-2 rounded-full ${
                        theme === 'dark' ? 'bg-indigo-400' : 'bg-indigo-500'
                      } animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                      <div className={`w-2 h-2 rounded-full ${
                        theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                      } animate-bounce`} style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentView === 'home' ? (
              <Asignaturas 
                memoria={memoria} 
                setMemoria={setMemoria}
                theme={theme}
                asignaturas={asignaturas}
                cursoSeleccionado={cursoSeleccionado}
                onAbsenceChange={loadAbsences}
              />
            ) : (
              <StatsPanel 
                asignaturas={asignaturas}
                memoria={memoria}
                cursoSeleccionado={cursoSeleccionado}
                theme={theme}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
