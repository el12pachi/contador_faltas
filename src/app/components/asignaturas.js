'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    Book, BookOpen, ChevronDown, ChevronUp, Minus, Plus,
    Clock, AlertCircle, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown,
    Search, X
} from 'lucide-react';

export default function Asignaturas({ memoria, setMemoria, theme, asignaturas, cursoSeleccionado, onAbsenceChange }) {
    const [expanded, setExpanded] = useState(new Set());
    const [sortBy, setSortBy] = useState('nombre');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState(null);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [pendingDeltas, setPendingDeltas] = useState({});
    const hadErrorRef = useRef(false);

    const listAsignaturas = asignaturas || [];

    // Componente de notificación
    const NotificationToast = ({ message, type, onClose }) => {
        React.useEffect(() => {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }, [onClose]);

        return (
            <div className={`fixed top-4 right-4 sm:right-6 z-[100] animate-fadeIn ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-lg shadow-xl border ${
                type === 'error' 
                    ? theme === 'dark' ? 'border-red-500/30' : 'border-red-200'
                    : theme === 'dark' ? 'border-green-500/30' : 'border-green-200'
            } p-4 min-w-[280px] max-w-[90vw] sm:max-w-md`}>
                <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        type === 'error' ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                        {type === 'error' ? (
                            <AlertCircle className="w-3 h-3 text-white" />
                        ) : (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            theme === 'dark' 
                                ? 'hover:bg-white/10 text-gray-400' 
                                : 'hover:bg-gray-100 text-gray-500'
                        }`}
                        aria-label="Cerrar notificación"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        );
    };

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

    const refreshAbsencesFromServer = async () => {
        try {
            const response = await fetch('/api/absences');
            const data = await response.json();
            if (data.absences) {
                setMemoria(data.absences);
            }
        } catch (error) {
            console.error('Error al recargar faltas desde la BD:', error);
        }
    };

    useEffect(() => {
        if (pendingRequests === 0 && hadErrorRef.current) {
            refreshAbsencesFromServer();
            hadErrorRef.current = false;
        }
    }, [pendingRequests]);

    const updateAbsenceInDb = async (moduleId, action, deltaValue) => {
        setPendingRequests(prev => prev + 1);
        try {
            const response = await fetch('/api/absences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ moduleId, action }),
            });
            const data = await response.json();
            if (data.success) {
                hadErrorRef.current = false;
                setMemoria(prev => ({
                    ...prev,
                    [moduleId]: Math.max(0, (prev[moduleId] || 0) + deltaValue)
                }));
                if (onAbsenceChange) {
                    onAbsenceChange();
                }
            } else {
                hadErrorRef.current = true;
                setNotification({
                    message: action === 'add' 
                        ? 'No se pudo agregar la falta. Inténtalo de nuevo.' 
                        : 'No se pudo quitar la falta. Inténtalo de nuevo.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error de red al actualizar falta:', error);
            hadErrorRef.current = true;
            setNotification({
                message: action === 'add' 
                    ? 'Error de conexión. No se pudo agregar la falta.' 
                    : 'Error de conexión. No se pudo quitar la falta.',
                type: 'error'
            });
        } finally {
            setPendingRequests(prev => Math.max(0, prev - 1));
            setPendingDeltas(prev => {
                const next = { ...prev };
                const current = next[moduleId] || 0;
                const updated = current - deltaValue;
                if (updated === 0) {
                    delete next[moduleId];
                } else {
                    next[moduleId] = updated;
                }
                return next;
            });
        }
    };

    const addFalta = (id) => {
        const deltaValue = 1;
        setPendingDeltas(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + deltaValue
        }));
        updateAbsenceInDb(id, 'add', deltaValue);
    }

    const removeFalta = (id) => {
        const currentValue = faltas(id);
        if (currentValue > 0) {
            const deltaValue = -1;
            setPendingDeltas(prev => ({
                ...prev,
                [id]: (prev[id] || 0) + deltaValue
            }));
            updateAbsenceInDb(id, 'remove', deltaValue);
        }
    }

    const faltas = (id) => {
        const base = memoria[id] ? memoria[id] : 0;
        const delta = pendingDeltas[id] || 0;
        return Math.max(0, base + delta);
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

    const asignaturasFiltradasPorCurso = listAsignaturas.filter(asig =>
        cursoSeleccionado ? asig.curso === cursoSeleccionado : true
    );

    const filteredAndSorted = asignaturasFiltradasPorCurso
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

    const totalHoras = asignaturasFiltradasPorCurso.reduce((total, data) => total + data.horas, 0);
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
        <>
            {/* Notificación Toast */}
            {notification && (
                <NotificationToast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            
            <div className="space-y-4 w-full max-w-6xl mx-auto">
            {/* Header Compacto */}
            <div className="mb-4 sm:mb-5">
                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-semibold mb-0.5 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                    Control de Asistencia
                </h1>
                <p className={`text-xs sm:text-sm ${
                    theme === 'dark' ? 'text-gray-400/90' : 'text-gray-600'
                }`}>
                    <span className="hidden sm:inline">{cursoSeleccionado}º curso • </span>
                    {asignaturasFiltradasPorCurso.length} materias • {totalHoras} horas totales
                </p>
            </div>

            {/* Barra de búsqueda y ordenamiento compacta */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                <div className="flex-1 relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                        theme === 'dark' ? 'text-gray-400/80' : 'text-gray-500'
                    }`} />
                    <input
                        type="text"
                        placeholder="Buscar materia..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-md border transition-colors ${
                            theme === 'dark'
                                ? 'bg-white/[0.06] border-white/8 text-white placeholder-gray-500/70 focus:border-blue-500/40 focus:bg-white/[0.08]'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        } focus:outline-none`}
                    />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 sm:pb-0 sm:mb-0">
                    {['nombre', 'faltas', 'progreso'].map((sort, idx) => (
                        <button
                            key={sort}
                            onClick={() => handleSort(sort)}
                            className={`px-2.5 sm:px-3 py-2 text-xs rounded-md transition-all capitalize font-medium whitespace-nowrap flex items-center gap-1.5 min-w-fit ${
                                sortBy === sort 
                                    ? theme === 'dark'
                                        ? 'bg-white/12 text-white shadow-sm'
                                        : 'bg-blue-500 text-white shadow-sm'
                                    : theme === 'dark'
                                        ? 'bg-white/[0.04] text-gray-400 hover:bg-white/8 hover:text-white/90'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <span className="hidden sm:inline">{sort}</span>
                            <span className="sm:hidden">
                                {sort === 'nombre' ? 'Nom' : sort === 'faltas' ? 'Fal' : 'Pro'}
                            </span>
                            {sortBy === sort && (
                                sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resumen compacto */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-4">
                <div className="glass-card rounded-md p-2.5 sm:p-3.5 text-center">
                    <p className={`text-xs mb-1 sm:mb-1.5 font-medium ${
                        theme === 'dark' ? 'text-gray-400/80' : 'text-gray-600'
                    }`}>Faltas</p>
                    <p className={`text-lg sm:text-xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{allfatas()}</p>
                </div>
                <div className="glass-card rounded-md p-2.5 sm:p-3.5 text-center">
                    <p className={`text-xs mb-1 sm:mb-1.5 font-medium ${
                        theme === 'dark' ? 'text-gray-400/80' : 'text-gray-600'
                    }`}>Porcentaje</p>
                    <p className={`text-lg sm:text-xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{porcentajeHoras().toFixed(1)}%</p>
                </div>
                <div className="glass-card rounded-md p-2.5 sm:p-3.5 text-center">
                    <p className={`text-xs mb-1 sm:mb-1.5 font-medium ${
                        theme === 'dark' ? 'text-gray-400/80' : 'text-gray-600'
                    }`}>Materias</p>
                    <p className={`text-lg sm:text-xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{listAsignaturas.length}</p>
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
                            className={`glass-card rounded-lg p-3 sm:p-4 transition-all duration-150 ${
                                theme === 'dark' ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex items-start sm:items-center gap-3">
                                {/* Icono */}
                                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br ${data.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>

                                {/* Contenido principal */}
                                <div className="flex-1 min-w-0">
                                    {/* Header con nombre y contador de faltas */}
                                    <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-sm sm:text-base font-semibold mb-1 truncate ${
                                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {data.nombre}
                                            </h3>
                                            <div className={`flex items-center gap-2 text-xs ${
                                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                                <span className="flex items-center gap-1">
                                                    <Clock className={`w-3 h-3 ${theme === 'dark' ? 'opacity-80' : 'opacity-70'}`} />
                                                    {data.horas}h
                                                </span>
                                                <span className={`${theme === 'dark' ? 'opacity-50' : 'opacity-40'}`}>•</span>
                                                <span>{Math.trunc(data.horas / 33)}h/sem</span>
                                            </div>
                                        </div>
                                        
                                        {/* Contador de faltas más compacto */}
                                        <div className={`flex items-baseline gap-1 px-2.5 py-1.5 rounded-lg ${status.bg} ${status.border} border flex-shrink-0`}>
                                            <span className={`text-sm font-semibold ${status.color}`}>
                                                {faltasActuales}
                                            </span>
                                            <span className={`text-xs ${status.color} opacity-70`}>
                                                /{maxFaltas}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Barra de progreso y botones en la misma línea */}
                                    <div className="flex items-center gap-2">
                                        {/* Barra de progreso */}
                                        <div className="flex-1 flex items-center gap-2 min-w-0">
                                            <div className={`flex-1 h-2 rounded-full overflow-hidden ${
                                                theme === 'dark' ? 'bg-white/[0.08]' : 'bg-gray-200'
                                            }`}>
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${status.progress} transition-all duration-400`}
                                                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <StatusIcon className={`w-3.5 h-3.5 ${status.color} opacity-90`} />
                                                <span className={`text-xs font-semibold ${status.color} min-w-[2.5rem]`}>
                                                    {porcentaje.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botones */}
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                                onClick={() => removeFalta(data.id)}
                                                disabled={faltasActuales === 0}
                                                className={`w-8 h-8 rounded-md disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 ${
                                                    theme === 'dark'
                                                        ? 'bg-white/[0.06] hover:bg-white/10'
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                                aria-label="Quitar falta"
                                            >
                                                <Minus className={`w-3.5 h-3.5 ${
                                                    theme === 'dark' ? 'text-white/90' : 'text-gray-700'
                                                }`} />
                                            </button>
                                            <button
                                                onClick={() => addFalta(data.id)}
                                                className="w-8 h-8 rounded-md bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                                                aria-label="Agregar falta"
                                            >
                                                <Plus className="w-3.5 h-3.5 text-white" />
                                            </button>
                                            <button
                                                onClick={() => subMenu(data.id)}
                                                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all active:scale-95 sm:hidden ${
                                                    theme === 'dark'
                                                        ? 'bg-white/[0.06] hover:bg-white/10'
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                                aria-label="Ver detalles"
                                            >
                                                {expanded.has(data.id) ? (
                                                    <ChevronUp className={`w-3.5 h-3.5 ${
                                                        theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                                                    }`} />
                                                ) : (
                                                    <ChevronDown className={`w-3.5 h-3.5 ${
                                                        theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                                                    }`} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Detalles expandidos */}
                            {expanded.has(data.id) && (
                                <div className={`mt-3 pt-3 border-t grid grid-cols-2 gap-3 sm:gap-3 ${
                                    theme === 'dark' ? 'border-white/8' : 'border-gray-200'
                                }`}>
                                    <div>
                                        <p className={`text-xs mb-1 font-medium ${
                                            theme === 'dark' ? 'text-gray-400/80' : 'text-gray-600'
                                        }`}>Horas totales</p>
                                        <p className={`text-sm font-semibold ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>{data.horas}h</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs mb-1 font-medium ${
                                            theme === 'dark' ? 'text-gray-400/80' : 'text-gray-600'
                                        }`}>Horas semanales</p>
                                        <p className={`text-sm font-semibold ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>{Math.trunc(data.horas / 33)}h</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs mb-1 font-medium ${
                                            theme === 'dark' ? 'text-gray-400/80' : 'text-gray-600'
                                        }`}>Máximo permitido</p>
                                        <p className={`text-sm font-semibold ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>{maxFaltas}h</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs mb-1 font-medium ${
                                            theme === 'dark' ? 'text-gray-400/80' : 'text-gray-600'
                                        }`}>Horas restantes</p>
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
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No se encontraron materias</p>
                </div>
            )}
            </div>
        </>
    );
}
