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
    const [processingModules, setProcessingModules] = useState(new Set());
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
        // Si ya hay una petición en curso para este módulo, ignorar
        if (processingModules.has(moduleId)) {
            return;
        }
        
        setProcessingModules(prev => new Set(prev).add(moduleId));
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
                // Si la API devuelve OK, no modificamos el estado local
                // Solo actualizamos desde el servidor
                hadErrorRef.current = false;
                if (data.absences) {
                    setMemoria(data.absences);
                }
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
            // Solo en caso de error de conexión, modificamos el estado local
            console.error('Error de red al actualizar falta:', error);
            hadErrorRef.current = true;
            setMemoria(prev => ({
                ...prev,
                [moduleId]: Math.max(0, (prev[moduleId] || 0) + deltaValue)
            }));
            setNotification({
                message: action === 'add' 
                    ? 'Error de conexión. No se pudo agregar la falta.' 
                    : 'Error de conexión. No se pudo quitar la falta.',
                type: 'error'
            });
        } finally {
            setPendingRequests(prev => Math.max(0, prev - 1));
            setProcessingModules(prev => {
                const next = new Set(prev);
                next.delete(moduleId);
                return next;
            });
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
        // Prevenir clics múltiples
        if (processingModules.has(id)) {
            return;
        }
        
        const deltaValue = 1;
        setPendingDeltas(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + deltaValue
        }));
        updateAbsenceInDb(id, 'add', deltaValue);
    }

    const removeFalta = (id) => {
        // Prevenir clics múltiples
        if (processingModules.has(id)) {
            return;
        }
        
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
        // Solo contar faltas de asignaturas del curso seleccionado
        let sum = 0;
        asignaturasFiltradasPorCurso.forEach(asig => {
            sum += memoria[asig.id] || 0;
        });
        return sum;
    };
    
    const porcentajeHoras = () => {
        const faltas = allfatas();
        return faltas === 0 || totalHoras === 0 ? 0 : (faltas * 100) / totalHoras;
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
            
            <div className="space-y-10 w-full max-w-7xl mx-auto">
            {/* Header masivo */}
            <div className="mb-16">
                <h1 className={`text-5xl font-semibold tracking-tight mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`} style={{ fontSize: '2.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
                    Asignaturas
                </h1>
                <p className={`text-lg ${
                    theme === 'dark' ? 'text-white/50' : 'text-gray-600'
                }`}>
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

            {/* Resumen masivo */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="glass-card rounded-lg p-4 text-center">
                    <p className={`text-xs mb-1.5 font-medium ${
                        theme === 'dark' ? 'text-white/40' : 'text-gray-500'
                    }`}>Faltas</p>
                    <p className={`text-xl font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{allfatas()}</p>
                </div>
                <div className="glass-card rounded-lg p-4 text-center">
                    <p className={`text-xs mb-1.5 font-medium ${
                        theme === 'dark' ? 'text-white/40' : 'text-gray-500'
                    }`}>Porcentaje</p>
                    <p className={`text-xl font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{porcentajeHoras().toFixed(1)}%</p>
                </div>
                <div className="glass-card rounded-lg p-4 text-center">
                    <p className={`text-xs mb-1.5 font-medium ${
                        theme === 'dark' ? 'text-white/40' : 'text-gray-500'
                    }`}>Materias</p>
                    <p className={`text-xl font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{listAsignaturas.length}</p>
                </div>
            </div>

            {/* Lista de materias minimalista */}
            <div className="space-y-3">
                {filteredAndSorted.map((data, idx) => {
                    const faltasActuales = faltas(data.id);
                    const maxFaltas = maxFaltasPermitidas(data.horas);
                    const porcentaje = porcentajeFaltas(data.horas, faltasActuales);
                    const status = getStatus(porcentaje);
                    const StatusIcon = status.icon;
                    
                    return (
                        <div
                            key={data.id}
                            className="glass-card rounded-lg p-4 transition-all duration-200"
                        >
                            <div className="flex items-start gap-4">
                                {/* Contenido principal */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-base font-medium mb-1 truncate ${
                                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {data.nombre}
                                            </h3>
                                            <div className={`flex items-center gap-2 text-sm ${
                                                theme === 'dark' ? 'text-white/40' : 'text-gray-500'
                                            }`}>
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{data.horas}h</span>
                                                <span>•</span>
                                                <span>{Math.trunc(data.horas / 33)}h/sem</span>
                                            </div>
                                        </div>
                                        
                                        {/* Contador compacto */}
                                        <div className={`flex items-baseline gap-1.5 px-3 py-1.5 rounded-lg ${status.bg} ${status.border} border flex-shrink-0`}>
                                            <span className={`text-base font-semibold ${status.color}`}>
                                                {faltasActuales}
                                            </span>
                                            <span className={`text-sm ${status.color} opacity-50`}>
                                                /{maxFaltas}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Barra de progreso */}
                                        <div className="flex-1 flex items-center gap-2 min-w-0">
                                            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/[0.08]">
                                                <div
                                                    className={`h-full rounded-full ${status.color.replace('text-', 'bg-')} transition-all duration-300`}
                                                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                                                <span className={`text-sm font-medium ${status.color} min-w-[2.5rem]`}>
                                                    {porcentaje.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botones pequeños */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => removeFalta(data.id)}
                                                disabled={faltasActuales === 0 || processingModules.has(data.id)}
                                                className="w-8 h-8 rounded-lg disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-all bg-white/[0.06] hover:bg-white/10 text-white"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => addFalta(data.id)}
                                                disabled={processingModules.has(data.id)}
                                                className="w-8 h-8 rounded-lg bg-white hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all text-black"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles expandidos */}
                            {expanded.has(data.id) && (
                                <div className={`mt-3 pt-3 border-t grid grid-cols-2 gap-2 ${
                                    theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                                }`}>
                                    <div>
                                        <p className={`text-xs mb-0.5 font-medium ${
                                            theme === 'dark' ? 'text-gray-400/60' : 'text-gray-600'
                                        }`}>Horas totales</p>
                                        <p className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>{data.horas}h</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs mb-0.5 font-medium ${
                                            theme === 'dark' ? 'text-gray-400/60' : 'text-gray-600'
                                        }`}>Horas semanales</p>
                                        <p className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>{Math.trunc(data.horas / 33)}h</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs mb-0.5 font-medium ${
                                            theme === 'dark' ? 'text-gray-400/60' : 'text-gray-600'
                                        }`}>Máximo permitido</p>
                                        <p className={`text-sm font-medium ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                        }`}>{maxFaltas}h</p>
                                    </div>
                                    <div>
                                        <p className={`text-xs mb-0.5 font-medium ${
                                            theme === 'dark' ? 'text-gray-400/60' : 'text-gray-600'
                                        }`}>Horas restantes</p>
                                        <p className={`text-sm font-medium ${status.color}`}>
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
