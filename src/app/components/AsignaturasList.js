'use client';

import React, { useEffect, useState } from 'react';
import {
    BookOpen, Minus, Plus, ChevronDown, ChevronUp,
    Clock, AlertCircle, CheckCircle2, ArrowUpDown,
    ArrowUp, ArrowDown, TrendingUp
} from 'lucide-react';

export default function AsignaturasList() {
    const [memoria, setMemoria] = useState({})
    const [expanded, setExpanded] = useState(new Set())
    const [sortBy, setSortBy] = useState('nombre') // 'nombre', 'faltas', 'progreso'
    const [sortOrder, setSortOrder] = useState('asc') // 'asc', 'desc'
    
    const [listAsignaturas] = useState([
        {
            id: 1,
            nombre: "Sistemas informáticos",
            horas: 167,
            color: "from-purple-500 to-indigo-600",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-400",
        },
        {
            id: 2,
            nombre: "Bases de Datos",
            horas: 200,
            color: "from-emerald-500 to-teal-600",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-400",
        },
        {
            id: 3,
            nombre: "Programación",
            horas: 267,
            color: "from-amber-500 to-orange-600",
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-400",
        },
        {
            id: 4,
            nombre: "Lenguajes de marcas y sistemas de gestión de información",
            horas: 67,
            color: "from-rose-500 to-pink-600",
            iconBg: "bg-rose-500/10",
            iconColor: "text-rose-400",
        },
        {
            id: 5,
            nombre: "Entornos de desarrollo",
            horas: 100,
            color: "from-violet-500 to-purple-600",
            iconBg: "bg-violet-500/10",
            iconColor: "text-violet-400",
        },
        {
            id: 6,
            nombre: "Itinerario personal para la empleabilidad I",
            horas: 100,
            color: "from-blue-500 to-cyan-600",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-400",
        },
        {
            id: 7,
            nombre: "Digitalización aplicada a los sectores productivos (GS)",
            horas: 33,
            color: "from-cyan-500 to-blue-600",
            iconBg: "bg-cyan-500/10",
            iconColor: "text-cyan-400",
        },
        {
            id: 8,
            nombre: "Inglés profesional",
            horas: 67,
            color: "from-fuchsia-500 to-pink-600",
            iconBg: "bg-fuchsia-500/10",
            iconColor: "text-fuchsia-400",
        }
    ]);

    useEffect(() => {
        const data = localStorage.getItem('asignaturas')
        if (data) {
            setMemoria(JSON.parse(data))
        } else {
            localStorage.setItem('asignaturas', JSON.stringify({}))
        }
    }, [])

    const faltas = (id) => memoria[id] || 0

    const maxFaltasPermitidas = (horas) => Math.trunc(horas * 0.15)

    const porcentajeFaltas = (horas, faltasActuales) => {
        const max = maxFaltasPermitidas(horas)
        if (max === 0) return 0
        return Math.min((faltasActuales / max) * 100, 100)
    }

    const horasRestantes = (horas, faltasActuales) => {
        return Math.max(0, maxFaltasPermitidas(horas) - faltasActuales)
    }

    const getStatus = (porcentaje) => {
        if (porcentaje >= 100) return { color: 'red', label: 'Límite alcanzado', icon: AlertCircle }
        if (porcentaje >= 80) return { color: 'amber', label: 'Riesgo', icon: AlertCircle }
        return { color: 'emerald', label: 'Bien', icon: CheckCircle2 }
    }

    const addFalta = (id) => {
        const newMemoria = { ...memoria, [id]: (memoria[id] || 0) + 1 }
        setMemoria(newMemoria)
        localStorage.setItem('asignaturas', JSON.stringify(newMemoria))
    }

    const removeFalta = (id) => {
        if ((memoria[id] || 0) > 0) {
            const newMemoria = { ...memoria, [id]: (memoria[id] || 0) - 1 }
            setMemoria(newMemoria)
            localStorage.setItem('asignaturas', JSON.stringify(newMemoria))
        }
    }

    const toggleExpand = (id) => {
        setExpanded(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(newSortBy)
            setSortOrder('asc')
        }
    }

    const sortedAsignaturas = [...listAsignaturas].sort((a, b) => {
        const faltasA = faltas(a.id)
        const faltasB = faltas(b.id)
        const porcentajeA = porcentajeFaltas(a.horas, faltasA)
        const porcentajeB = porcentajeFaltas(b.horas, faltasB)

        let comparison = 0
        switch (sortBy) {
            case 'nombre':
                comparison = a.nombre.localeCompare(b.nombre)
                break
            case 'faltas':
                comparison = faltasA - faltasB
                break
            case 'progreso':
                comparison = porcentajeA - porcentajeB
                break
        }

        return sortOrder === 'asc' ? comparison : -comparison
    })

    return (
        <div className="ml-64 p-8 space-y-6">
            {/* Sort Controls */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Ordenar por:</span>
                <div className="flex gap-2">
                    {[
                        { id: 'nombre', label: 'Nombre' },
                        { id: 'faltas', label: 'Faltas' },
                        { id: 'progreso', label: 'Progreso' }
                    ].map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSort(option.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                sortBy === option.id
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {option.label}
                                {sortBy === option.id && (
                                    sortOrder === 'asc' ? (
                                        <ArrowUp className="w-3 h-3" />
                                    ) : (
                                        <ArrowDown className="w-3 h-3" />
                                    )
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Asignaturas Grid */}
            <div className="grid gap-4">
                {sortedAsignaturas.map((data) => {
                    const faltasActuales = faltas(data.id)
                    const maxFaltas = maxFaltasPermitidas(data.horas)
                    const porcentaje = porcentajeFaltas(data.horas, faltasActuales)
                    const status = getStatus(porcentaje)
                    const StatusIcon = status.icon

                    return (
                        <div
                            key={data.id}
                            className="group bg-gray-800/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 dark:border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-black/20"
                        >
                            <div className="flex items-start justify-between gap-6">
                                {/* Left Section */}
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${data.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                        <BookOpen className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                                            {data.nombre}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                <span>{data.horas} horas</span>
                                            </div>
                                            <span>•</span>
                                            <span>{Math.trunc(data.horas / 33)}h/semana</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section - Controls */}
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    {/* Status Badge */}
                                    <div className={`px-4 py-2 rounded-xl bg-${status.color}-500/10 border border-${status.color}-500/20 flex items-center gap-2`}>
                                        <StatusIcon className={`w-4 h-4 text-${status.color}-400`} />
                                        <span className={`text-sm font-medium text-${status.color}-400`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Faltas Counter */}
                                    <div className="text-center bg-gray-900/50 rounded-xl p-4 min-w-[90px] border border-gray-700/50">
                                        <p className="text-xs text-gray-400 mb-1">Faltas</p>
                                        <p className={`text-2xl font-bold ${status.color === 'red' ? 'text-red-400' : status.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            {faltasActuales}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">/ {maxFaltas}</p>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => removeFalta(data.id)}
                                            disabled={faltasActuales === 0}
                                            className="w-10 h-10 rounded-xl bg-gray-700/50 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 active:scale-95"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => addFalta(data.id)}
                                            className="w-10 h-10 rounded-xl bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-all duration-200 active:scale-95 shadow-lg shadow-blue-500/30"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Expand Button */}
                                    <button
                                        onClick={() => toggleExpand(data.id)}
                                        className="w-10 h-10 rounded-xl bg-gray-700/50 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                                    >
                                        {expanded.has(data.id) ? (
                                            <ChevronUp className="w-5 h-5" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-400">Progreso</span>
                                    <span className={`text-sm font-semibold ${status.color === 'red' ? 'text-red-400' : status.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {porcentaje.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-900/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                                            status.color === 'red'
                                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                : status.color === 'amber'
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                        }`}
                                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expanded.has(data.id) && (
                                <div className="mt-6 pt-6 border-t border-gray-700/50 animate-fadeIn">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <p className="text-xs text-gray-400">Horas totales</p>
                                            </div>
                                            <p className="text-xl font-bold text-white">{data.horas}h</p>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="w-4 h-4 text-gray-400" />
                                                <p className="text-xs text-gray-400">Horas semanales</p>
                                            </div>
                                            <p className="text-xl font-bold text-white">{Math.trunc(data.horas / 33)}h</p>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                                <p className="text-xs text-gray-400">Máximo permitido</p>
                                            </div>
                                            <p className="text-xl font-bold text-white">{maxFaltas}h</p>
                                        </div>
                                        <div className={`bg-${status.color}-500/10 rounded-xl p-4 border border-${status.color}-500/20`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <StatusIcon className={`w-4 h-4 text-${status.color}-400`} />
                                                <p className={`text-xs text-${status.color}-400`}>Horas restantes</p>
                                            </div>
                                            <p className={`text-xl font-bold text-${status.color}-400`}>
                                                {horasRestantes(data.horas, faltasActuales)}h
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

