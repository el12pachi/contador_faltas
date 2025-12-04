'use client';

import React from 'react';
import { 
    User, Settings, Moon, Sun, Book, BarChart3, 
    X, Menu, Home, LogOut, ChevronLeft, ArrowLeft
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export default function Sidebar({ isOpen, onClose, theme, onThemeChange, currentView, onViewChange, cursoSeleccionado, onCursoChange, cursos, sidebarCollapsed, onSidebarToggle }) {
    const { data: session } = useSession();
    const userName = session?.user?.nombre || 'Usuario';
    const userImage = session?.user?.urlLogo || null;
    const menuItems = [
        { id: 'home', label: 'Inicio', icon: Home },
        { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
    ];

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-screen z-50
                transform transition-all duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:z-auto lg:h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                ${sidebarCollapsed ? 'lg:w-20 w-72' : 'w-72'}
                ${theme === 'dark' 
                    ? 'bg-[#111827] border-r border-white/10' 
                    : 'bg-white border-r border-gray-200 shadow-sm'
                }
            `}>
                <div className="flex flex-col h-full p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ${
                                    theme === 'dark' ? '' : 'shadow-md'
                                }`}>
                                    <Book className="w-5 h-5 text-white" />
                                </div>
                                <h2 className={`text-xl font-semibold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>Control</h2>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {onSidebarToggle && (
                                <button
                                    onClick={onSidebarToggle}
                                    className={`hidden lg:flex w-8 h-8 rounded-lg items-center justify-center transition-colors ${
                                        theme === 'dark'
                                            ? 'bg-white/5 hover:bg-white/10 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                    title={sidebarCollapsed ? "Mostrar menú" : "Ocultar menú"}
                                >
                                    {sidebarCollapsed ? (
                                        <ChevronRight className="w-5 h-5" />
                                    ) : (
                                        <ChevronLeft className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className={`lg:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                    theme === 'dark'
                                        ? 'bg-white/5 hover:bg-white/10 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Botón Volver al menú principal */}
                    {!sidebarCollapsed && cursoSeleccionado && (
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    onCursoChange(null);
                                    onClose();
                                }}
                                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="font-medium">Volver al menú principal</span>
                            </button>
                        </div>
                    )}

                    {/* Navigation */}
                    {!sidebarCollapsed && (
                        <nav className="flex-1 space-y-2 mb-6 overflow-y-auto">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = currentView === item.id && cursoSeleccionado;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (!cursoSeleccionado) {
                                                return;
                                            }
                                            onViewChange(item.id);
                                            onClose();
                                        }}
                                        disabled={!cursoSeleccionado}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                            transition-all duration-200
                                            ${!cursoSeleccionado 
                                                ? 'opacity-50 cursor-not-allowed text-gray-600' 
                                                : isActive 
                                                    ? 'bg-white/10 text-white shadow-lg' 
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    )}

                    {/* Settings Section */}
                    <div className="border-t border-white/10 pt-6 space-y-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={onThemeChange}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group`}
                            title={sidebarCollapsed ? (theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro') : ''}
                        >
                            <div className="flex items-center gap-3">
                                {theme === 'dark' ? (
                                    <Moon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                ) : (
                                    <Sun className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                )}
                                {!sidebarCollapsed && (
                                    <span className="font-medium text-gray-400 group-hover:text-white">
                                        {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                                    </span>
                                )}
                            </div>
                            {!sidebarCollapsed && (
                                <div className={`
                                    w-12 h-6 rounded-full p-1 transition-colors
                                    ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-600'}
                                `}>
                                    <div className={`
                                        w-4 h-4 rounded-full bg-white transition-transform
                                        ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}
                                    `} />
                                </div>
                            )}
                        </button>

                        {/* Profile */}
                        <button 
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors`}
                            title={sidebarCollapsed ? userName : ''}
                        >
                            {userImage ? (
                                <img 
                                    src={userImage} 
                                    alt={userName}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                            {!sidebarCollapsed && (
                                <span className="font-medium text-gray-400 hover:text-white truncate flex-1 text-left">
                                    {userName}
                                </span>
                            )}
                        </button>

                        {/* Logout */}
                        <button 
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors group`}
                            title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
                        >
                            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                            {!sidebarCollapsed && (
                                <span className="font-medium text-red-400 group-hover:text-red-300">Cerrar Sesión</span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
