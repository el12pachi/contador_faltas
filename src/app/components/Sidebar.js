'use client';

import React from 'react';
import { 
    User, Settings, Moon, Sun, Book, BarChart3, 
    X, Menu, Home, LogOut, ChevronLeft, ChevronRight, ArrowLeft
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
                ${sidebarCollapsed ? 'lg:w-20 w-64' : 'w-64'}
                ${theme === 'dark' 
                    ? 'bg-black border-r border-white/10' 
                    : 'bg-white border-r border-black/10'
                }
            `}>
                <div className={`flex flex-col h-full ${sidebarCollapsed ? 'p-4' : 'p-6'}`}>
                    {/* Header */}
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} ${sidebarCollapsed ? 'mb-8' : 'mb-8'}`}>
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                                    <Book className="w-5 h-5 text-black" />
                                </div>
                                <h2 className={`text-lg font-medium tracking-tight ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`} style={{ fontSize: '1.125rem', fontWeight: 500 }}>Asistencia</h2>
                            </div>
                        )}
                        {onSidebarToggle && (
                            <button
                                onClick={onSidebarToggle}
                                className={`${sidebarCollapsed ? 'flex' : 'hidden lg:flex'} w-8 h-8 rounded-lg items-center justify-center transition-colors ${
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

                    {/* Botón Volver al menú principal */}
                    {cursoSeleccionado && (
                        <div className="mb-4">
                            <button
                                onClick={() => {
                                    onCursoChange(null);
                                    onClose();
                                }}
                                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'gap-2 px-3 py-2'} rounded-lg transition-all duration-200 text-sm ${
                                    theme === 'dark'
                                        ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                title={sidebarCollapsed ? 'Volver al menú principal' : ''}
                            >
                                <ArrowLeft className={`${sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                                {!sidebarCollapsed && (
                                    <span className="font-medium">Volver</span>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 mb-8 overflow-y-auto">
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
                                        w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-lg
                                        transition-all duration-200
                                        ${!cursoSeleccionado 
                                            ? 'opacity-30 cursor-not-allowed text-white/40'
                                            : isActive 
                                                ? theme === 'dark'
                                                    ? 'bg-white text-black'
                                                    : 'bg-black text-white'
                                                : theme === 'dark'
                                                    ? 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                                    `}
                                    title={sidebarCollapsed ? item.label : ''}
                                    style={{ minHeight: '40px' }}
                                >
                                    <Icon className="w-5 h-5" />
                                    {!sidebarCollapsed && (
                                        <span className="font-medium text-sm">{item.label}</span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Settings Section */}
                    <div className="border-t pt-6 space-y-3 border-white/10">
                        {/* Theme Toggle */}
                        <button
                            onClick={onThemeChange}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-lg transition-all ${
                                theme === 'dark'
                                    ? 'bg-white/[0.06] hover:bg-white/[0.08]'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            style={{ minHeight: '40px' }}
                            title={sidebarCollapsed ? (theme === 'dark' ? 'Modo claro' : 'Modo oscuro') : ''}
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-white" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-900" />
                            )}
                            {!sidebarCollapsed && (
                                <span className="font-medium text-sm text-white">
                                    {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                                </span>
                            )}
                        </button>

                        {/* Profile */}
                        <button 
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-lg transition-colors ${
                                theme === 'dark'
                                    ? 'bg-white/[0.06] hover:bg-white/[0.08]'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            style={{ minHeight: '40px' }}
                            title={sidebarCollapsed ? userName : ''}
                        >
                            {userImage ? (
                                <img 
                                    src={userImage} 
                                    alt={userName}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                    <User className="w-4 h-4 text-black" />
                                </div>
                            )}
                            {!sidebarCollapsed && (
                                <span className="font-medium text-sm truncate flex-1 text-left text-white">
                                    {userName}
                                </span>
                            )}
                        </button>

                        {/* Logout */}
                        <button 
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3'} rounded-lg transition-colors ${
                                theme === 'dark'
                                    ? 'bg-red-500/10 hover:bg-red-500/20'
                                    : 'bg-red-50 hover:bg-red-100'
                            }`}
                            style={{ minHeight: '40px' }}
                            title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
                        >
                            <LogOut className="w-5 h-5 text-red-500" />
                            {!sidebarCollapsed && (
                                <span className="font-medium text-sm text-red-500">Cerrar Sesión</span>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
