'use client';

import React from 'react';
import { TrendingUp, Clock, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react';

export default function StatsPanel({ asignaturas, memoria, cursoSeleccionado, theme = 'dark' }) {
    const allfatas = () => {
        let sum = 0;
        for (const value in memoria) {
            sum += memoria[value];
        }
        return sum;
    };

    const asignaturasFiltradas = cursoSeleccionado
        ? asignaturas.filter(a => a.curso === cursoSeleccionado)
        : asignaturas;

    const totalHoras = asignaturasFiltradas.reduce((total, data) => total + data.horas, 0);
    const totalFaltas = allfatas();
    const porcentajeTotal = totalHoras > 0 ? (totalFaltas * 100) / totalHoras : 0;

    const getStatus = (porcentaje) => {
        if (porcentaje >= 100) return { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle, label: 'Crítico' };
        if (porcentaje >= 80) return { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertCircle, label: 'Riesgo' };
        return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Bien' };
    };

    const materiasConFaltas = asignaturasFiltradas.map(data => {
        const faltasActuales = memoria[data.id] || 0;
        const maxFaltas = Math.trunc(data.horas * 0.15);
        const porcentaje = maxFaltas > 0 ? (faltasActuales / maxFaltas) * 100 : 0;
        return { ...data, faltasActuales, maxFaltas, porcentaje };
    });

    const materiasCriticas = materiasConFaltas.filter(m => m.porcentaje >= 100).length;
    const materiasRiesgo = materiasConFaltas.filter(m => m.porcentaje >= 80 && m.porcentaje < 100).length;
    const materiasBien = materiasConFaltas.filter(m => m.porcentaje < 80).length;

    const statusTotal = getStatus(porcentajeTotal);
    const StatusIcon = statusTotal.icon;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className={`text-3xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Estadísticas</h2>
                    <p className={`mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Análisis completo de tu asistencia</p>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Total Faltas</p>
                    </div>
                    <p className={`text-4xl font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{totalFaltas}</p>
                    <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                    }`}>de {totalHoras} horas</p>
                </div>

                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Porcentaje</p>
                    </div>
                    <p className={`text-4xl font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{porcentajeTotal.toFixed(2)}%</p>
                    <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                    }`}>del total</p>
                </div>

                <div className={`glass-card rounded-2xl p-6 ${statusTotal.bg}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusTotal.color.replace('text-', 'bg-').replace('-500', '-500/20')}`}>
                            <StatusIcon className={`w-5 h-5 ${statusTotal.color}`} />
                        </div>
                        <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Estado</p>
                    </div>
                    <p className={`text-4xl font-bold mb-1 ${statusTotal.color}`}>{statusTotal.label}</p>
                    <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                    }`}>General</p>
                </div>
            </div>

            {/* Status Breakdown */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className={`text-xl font-semibold mb-6 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Estado por Materias</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <span className="font-semibold text-emerald-500">Bien</span>
                        </div>
                        <p className={`text-3xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{materiasBien}</p>
                        <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>materias</p>
                    </div>
                    <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            <span className="font-semibold text-amber-500">Riesgo</span>
                        </div>
                        <p className={`text-3xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{materiasRiesgo}</p>
                        <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>materias</p>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="font-semibold text-red-500">Crítico</span>
                        </div>
                        <p className={`text-3xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{materiasCriticas}</p>
                        <p className={`text-sm mt-1 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>materias</p>
                    </div>
                </div>
            </div>

            {/* Top Materias */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className={`text-xl font-semibold mb-6 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Materias con Más Faltas</h3>
                <div className="space-y-3">
                    {materiasConFaltas
                        .sort((a, b) => b.faltasActuales - a.faltasActuales)
                        .slice(0, 5)
                        .map((materia, index) => {
                            const status = getStatus(materia.porcentaje);
                            const StatusIcon = status.icon;
                            return (
                                <div key={materia.id} className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                                    theme === 'dark'
                                        ? 'bg-white/5 hover:bg-white/10'
                                        : 'bg-gray-50 hover:bg-gray-100'
                                }`}>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                            theme === 'dark'
                                                ? 'bg-gradient-to-br from-gray-600 to-gray-700 text-white'
                                                : 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${
                                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}>{materia.nombre}</p>
                                            <p className={`text-sm ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>{materia.faltasActuales} faltas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bg}`}>
                                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                                            <span className={`text-sm font-medium ${status.color}`}>
                                                {materia.porcentaje.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}

