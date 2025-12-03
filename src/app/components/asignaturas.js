'use client';

import React, { useEffect, useState } from 'react';
import {
    Book, BookOpen, ChevronDown, ChevronUp, Minus, Plus,
    Clock, AlertCircle, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown,
    Search
} from 'lucide-react';

export default function Asignaturas({ memoria, setMemoria, theme, asignaturas }) {
    const [expanded, setExpanded] = useState(new Set());
    const [sortBy, setSortBy] = useState('nombre');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [listAsignaturas] = useState(asignaturas || []);

    const subMenu = (id) => {
        setExpanded(data => {
            const menu = new Set(data);
            if (menu.has(id)) {
                menu.delete(id);
            } else {
                menu.add(id);
            }
            return menu;
        });
    }

    const addFalta = (id) => {
        const newMemoria = { ...memoria, [id]: (memoria[id] || 0) + 1 };
        setMemoria(newMemoria);
        localStorage.setItem('asignaturas', JSON.stringify(newMemoria));
    }

    const removeFalta = (id) => {
        if ((memoria[id] || 0) > 0) {
            const newMemoria = { ...memoria, [id]: (memoria[id] || 0) - 1 };
            setMemoria(newMemoria);
            localStorage.setItem('asignaturas', JSON.stringify(newMemoria));
        }
    }

    const faltas = (id) => {
        return memoria[id] ? memoria[id] : 0;
    }

    const maxFaltasPermitidas = (horas) => {
        return Math.trunc(horas * 0.15);
    }

    const porcentajeFaltas = (horas, faltasActuales) => {
        const max = maxFaltasPermitidas(horas);
        if (max === 0) return 0;
        return Math.min((faltasActuales / max) * 100, 100);
    }

    const getStatus = (porcentaje) => {
        if (porcentaje >= 100) return { 
            color: 'text-red-400', 
            bg: 'bg-red-500/10', 
            border: 'border-red-500/30',
            progress: 'from-red-500 to-red-600',
            icon: AlertCircle
        };
        if (porcentaje >= 80) return { 
            color: 'text-amber-400', 
            bg: 'bg-amber-500/10', 
            border: 'border-amber-500/30',
            progress: 'from-amber-400 to-orange-500',
            icon: AlertCircle
        };
        return { 
            color: 'text-emerald-400', 
            bg: 'bg-emerald-500/10', 
            border: 'border-emerald-500/30',
            progress: 'from-emerald-400 to-teal-500',
            icon: CheckCircle2
        };
    }

    const filteredAndSorted = listAsignaturas
        .filter(asig => 
            asig.nombre.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(asig => {
            const faltasActuales = faltas(asig.id);
            const porcentaje = porcentajeFaltas(asig.horas, faltasActuales);
            return { ...asig, faltasActuales, porcentaje };
        })
        .sort((a, b) => {
            let comparison = 0;
            switch(sortBy) {
                case 'faltas':
                    comparison = a.faltasActuales - b.faltasActuales;
                    break;
                case 'progreso':
                    comparison = a.porcentaje - b.porcentaje;
                    break;
                case 'nombre':
                default:
                    comparison = a.nombre.localeCompare(b.nombre);
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    };

    const totalHoras = listAsignaturas.reduce((total, data) => total + data.horas, 0);
    const allfatas = () => {
        let sum = 0;
        for (const value in memoria) {
            sum += memoria[value];
        }
        return sum;
    };
    const porcentajeHoras = () => {
        const faltas = allfatas();
        return faltas === 0 ? 0 : (faltas * 100) / totalHoras;
    };

    return (
        <div className="space-y-4 w-full max-w-6xl mx-auto">
            {/* Header Compacto */}
            <div className="mb-5">
                <h1 className="text-2xl lg:text-3xl font-semibold text-white mb-0.5">
                    Control de Asistencia
                </h1>
                <p className="text-sm text-gray-400/90">
                    {listAsignaturas.length} materias • {totalHoras} horas totales
                </p>
            </div>

            {/* Barra de búsqueda y ordenamiento compacta */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400/80" />
                    <input
                        type="text"
                        placeholder="Buscar materia..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md bg-white/[0.06] border border-white/8 text-white placeholder-gray-500/70 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.08] transition-colors"
                    />
                </div>
                <div className="flex gap-1.5">
                    {['nombre', 'faltas', 'progreso'].map((sort, idx) => (
                        <button
                            key={sort}
                            onClick={() => handleSort(sort)}
                            className={`px-3 py-2 text-xs rounded-md transition-all capitalize font-medium ${
                                sortBy === sort 
                                    ? 'bg-white/12 text-white shadow-sm' 
                                    : 'bg-white/[0.04] text-gray-400 hover:bg-white/8 hover:text-white/90'
                            }`}
                            style={{ marginLeft: idx === 0 ? '0' : '0' }}
                        >
                            {sort}
                            {sortBy === sort && (
                                sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1.5" /> : <ArrowDown className="w-3 h-3 inline ml-1.5" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resumen compacto */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="glass-card rounded-md p-3.5 text-center">
                    <p className="text-xs text-gray-400/80 mb-1.5 font-medium">Faltas</p>
                    <p className="text-xl font-bold text-white">{allfatas()}</p>
                </div>
                <div className="glass-card rounded-md p-3.5 text-center">
                    <p className="text-xs text-gray-400/80 mb-1.5 font-medium">Porcentaje</p>
                    <p className="text-xl font-bold text-white">{porcentajeHoras().toFixed(1)}%</p>
                </div>
                <div className="glass-card rounded-md p-3.5 text-center">
                    <p className="text-xs text-gray-400/80 mb-1.5 font-medium">Materias</p>
                    <p className="text-xl font-bold text-white">{listAsignaturas.length}</p>
                </div>
            </div>

            {/* Lista de materias compacta */}
            <div className="space-y-2.5">
                {filteredAndSorted.map((data, idx) => {
                    const faltasActuales = faltas(data.id);
                    const maxFaltas = maxFaltasPermitidas(data.horas);
                    const porcentaje = porcentajeFaltas(data.horas, faltasActuales);
                    const status = getStatus(porcentaje);
                    const StatusIcon = status.icon;
                    
                    return (
                        <div
                            key={data.id}
                            className="glass-card rounded-md p-4 hover:bg-white/[0.06] transition-all duration-150"
                            style={{ 
                                marginTop: idx === 0 ? '0' : '0.5rem',
                                borderRadius: idx % 2 === 0 ? '0.5rem' : '0.375rem'
                            }}
                        >
                            <div className="flex items-center gap-3.5">
                                {/* Icono pequeño */}
                                <div className={`w-11 h-11 rounded-md bg-gradient-to-br ${data.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>

                                {/* Información principal */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-white mb-0.5 truncate leading-tight">
                                        {data.nombre}
                                    </h3>
                                    <div className="flex items-center gap-2.5 text-xs text-gray-400/90">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 opacity-80" />
                                            {data.horas}h
                                        </span>
                                        <span className="opacity-50">•</span>
                                        <span>{Math.trunc(data.horas / 33)}h/sem</span>
                                    </div>
                                </div>

                                {/* Contador de faltas compacto */}
                                <div className={`text-center px-3.5 py-2.5 rounded-md border ${status.bg} ${status.border} min-w-[72px]`}>
                                    <p className={`text-lg font-bold ${status.color} leading-none`}>
                                        {faltasActuales}
                                    </p>
                                    <p className="text-xs text-gray-400/70 mt-0.5">
                                        / {maxFaltas}
                                    </p>
                                </div>

                                {/* Botones compactos */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => removeFalta(data.id)}
                                        disabled={faltasActuales === 0}
                                        className="w-8 h-8 rounded-md bg-white/[0.04] hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
                                    >
                                        <Minus className="w-4 h-4 text-white/90" />
                                    </button>
                                    <button
                                        onClick={() => addFalta(data.id)}
                                        className="w-8 h-8 rounded-md bg-blue-500/90 hover:bg-blue-500 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                                    >
                                        <Plus className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                {/* Botón expandir */}
                                <button
                                    onClick={() => subMenu(data.id)}
                                    className="w-8 h-8 rounded-md bg-white/[0.04] hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
                                >
                                    {expanded.has(data.id) ? (
                                        <ChevronUp className="w-4 h-4 text-white/80" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-white/80" />
                                    )}
                                </button>
                            </div>

                            {/* Barra de progreso compacta */}
                            <div className="mt-3 pt-3 border-t border-white/8">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-gray-400/80 font-medium">Progreso</span>
                                    <div className="flex items-center gap-1.5">
                                        <StatusIcon className={`w-3.5 h-3.5 ${status.color} opacity-90`} />
                                        <span className={`text-xs font-semibold ${status.color}`}>
                                            {porcentaje.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${status.progress} transition-all duration-400`}
                                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Detalles expandidos */}
                            {expanded.has(data.id) && (
                                <div className="mt-3 pt-3 border-t border-white/8 grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-400/80 mb-1 font-medium">Horas totales</p>
                                        <p className="text-sm font-semibold text-white">{data.horas}h</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400/80 mb-1 font-medium">Horas semanales</p>
                                        <p className="text-sm font-semibold text-white">{Math.trunc(data.horas / 33)}h</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400/80 mb-1 font-medium">Máximo permitido</p>
                                        <p className="text-sm font-semibold text-white">{maxFaltas}h</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400/80 mb-1 font-medium">Horas restantes</p>
                                        <p className={`text-sm font-semibold ${status.color}`}>
                                            {Math.max(0, maxFaltas - faltasActuales)}h
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredAndSorted.length === 0 && (
                <div className="glass-card rounded-lg p-8 text-center">
                    <p className="text-gray-400">No se encontraron materias</p>
                </div>
            )}
        </div>
    );
}
