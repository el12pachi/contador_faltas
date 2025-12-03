'use client';

import { useState, useEffect } from 'react';
import Asignaturas from './components/asignaturas';
import Sidebar from './components/Sidebar';
import StatsPanel from './components/StatsPanel';
import { Menu } from 'lucide-react';

const ASIGNATURAS = [
  { id: 1, nombre: "Sistemas informáticos", horas: 167, color: "from-purple-500 via-indigo-500 to-blue-500" },
  { id: 2, nombre: "Bases de Datos", horas: 200, color: "from-emerald-400 via-teal-500 to-cyan-500" },
  { id: 3, nombre: "Programación", horas: 267, color: "from-amber-400 via-orange-500 to-red-500" },
  { id: 4, nombre: "Lenguajes de marcas y sistemas de gestión de información", horas: 67, color: "from-rose-400 via-pink-500 to-fuchsia-500" },
  { id: 5, nombre: "Entornos de desarrollo", horas: 100, color: "from-violet-500 via-purple-500 to-indigo-500" },
  { id: 6, nombre: "Itinerario personal para la empleabilidad I", horas: 100, color: "from-blue-400 via-cyan-500 to-teal-500" },
  { id: 7, nombre: "Digitalización aplicada a los sectores productivos (GS)", horas: 33, color: "from-cyan-400 via-blue-500 to-indigo-500" },
  { id: 8, nombre: "Inglés profesional", horas: 67, color: "from-fuchsia-400 via-pink-500 to-rose-500" }
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('home');
  const [memoria, setMemoria] = useState({});

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.className = savedTheme;

    // Load data from localStorage
    const data = localStorage.getItem('asignaturas');
    if (data) {
      setMemoria(JSON.parse(data));
    } else {
      localStorage.setItem('asignaturas', JSON.stringify({}));
    }
  }, []);

  const handleThemeChange = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.className = newTheme;
  };

  return (
    <div className="flex h-screen bg-[#000000] text-white overflow-hidden">
      {/* Sidebar - Ocupa toda la altura, sin scroll */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onThemeChange={handleThemeChange}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main Content - Solo esta parte tiene scroll */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar - Only on mobile */}
        <div className="lg:hidden flex-shrink-0 bg-[#111827]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content Area - Scroll solo aquí */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 xl:p-10 max-w-7xl mx-auto w-full">
            {currentView === 'home' ? (
              <Asignaturas 
                memoria={memoria} 
                setMemoria={setMemoria}
                theme={theme}
                asignaturas={ASIGNATURAS}
              />
            ) : (
              <StatsPanel 
                asignaturas={ASIGNATURAS}
                memoria={memoria}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
