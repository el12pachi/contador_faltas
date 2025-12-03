'use client';

import React from 'react';
import { 
    User, Settings, Moon, Sun, Book, BarChart3, 
    X, Menu, Home
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, theme, onThemeChange, currentView, onViewChange }) {
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
                fixed top-0 left-0 h-screen w-72 bg-[#111827] border-r border-white/10 z-50
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:z-auto lg:h-screen
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Book className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Control</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onViewChange(item.id);
                                        onClose();
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                        transition-all duration-200
                                        ${isActive 
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

                    {/* Settings Section */}
                    <div className="border-t border-white/10 pt-6 space-y-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={onThemeChange}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                {theme === 'dark' ? (
                                    <Moon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                ) : (
                                    <Sun className="w-5 h-5 text-gray-400 group-hover:text-white" />
                                )}
                                <span className="font-medium text-gray-400 group-hover:text-white">
                                    {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                                </span>
                            </div>
                            <div className={`
                                w-12 h-6 rounded-full p-1 transition-colors
                                ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-600'}
                            `}>
                                <div className={`
                                    w-4 h-4 rounded-full bg-white transition-transform
                                    ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}
                                `} />
                            </div>
                        </button>

                        {/* Profile */}
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-400 hover:text-white">Perfil</span>
                        </button>

                        {/* Settings */}
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                            <Settings className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-400 hover:text-white">Configuración</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
