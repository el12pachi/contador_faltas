'use client';

import React, { useEffect, useState } from 'react';
import {
    TrendingUp, Clock, AlertCircle, CheckCircle2,
    BarChart3, PieChart, Activity
} from 'lucide-react';

export default function Statistics() {
    const [memoria, setMemoria] = useState({})
    const [listAsignaturas] = useState([
        { id: 1, nombre: "Sistemas informáticos", horas: 167 },
        { id: 2, nombre: "Bases de Datos", horas: 200 },
        { id: 3, nombre: "Programación", horas: 267 },
        { id: 4, nombre: "Lenguajes de marcas y sistemas de gestión de información", horas: 67 },
        { id: 5, nombre: "Entornos de desarrollo", horas: 100 },
        { id: 6, nombre: "Itinerario personal para la empleabilidad I", horas: 100 },
        { id: 7, nombre: "Digitalización aplicada a los sectores productivos (GS)", horas: 33 },
        { id: 8, nombre: "Inglés profesional", horas: 67 },
    ]);

    useEffect(() => {
        const data = localStorage.getItem('asignaturas')
        if (data) {
            setMemoria(JSON.parse(data))
        }
    }, [])

    const faltas = (id) => memoria[id] || 0

    const maxFaltasPermitidas = (horas) => Math.trunc(horas * 0.15)

    const porcentajeFaltas = (horas, faltasActuales) => {
        const max = maxFaltasPermitidas(horas)
        if (max === 0) return 0
        return Math.min((faltasActuales / max) * 100, 100)
    }

    const allfatas = () => {
        let sum = 0
        for (const value in memoria) {
            sum += memoria[value]
        }
        return sum
    }

    const totalHoras = listAsignaturas.reduce((total, data) => total + data.horas, 0)
    const totalFaltasPermitidas = listAsignaturas.reduce((total, data) => total + maxFaltasPermitidas(data.horas), 0)
    const porcentajeGeneral = totalFaltasPermitidas > 0 ? (allfatas() * 100) / totalFaltasPermitidas : 0

    const asignaturasConDatos = listAsignaturas.map(data => ({
        ...data,
        faltas: faltas(data.id),
        maxFaltas: maxFaltasPermitidas(data.horas),
        porcentaje: porcentajeFaltas(data.horas, faltas(data.id))
    }))

    const getStatusCount = () => {
        let safe = 0, warning = 0, danger = 0
        asignaturasConDatos.forEach(item => {
            if (item.porcentaje >= 100) danger++
            else if (item.porcentaje >= 80) warning++
            else safe++
        })
        return { safe, warning, danger }
    }

    const statusCount = getStatusCount()

    const maxBarHeight = 200

    return (
        <div className="ml-64 p-8 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Total Faltas</p>
                            <p className="text-2xl font-bold text-white">{allfatas()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Porcentaje</p>
                            <p className="text-2xl font-bold text-white">{porcentajeGeneral.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">En Buen Estado</p>
                            <p className="text-2xl font-bold text-white">{statusCount.safe}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">En Riesgo</p>
                            <p className="text-2xl font-bold text-white">{statusCount.warning + statusCount.danger}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-white">Faltas por Asignatura</h3>
                    </div>
                    <div className="space-y-4">
                        {asignaturasConDatos.map((item) => {
                            const barHeight = item.maxFaltas > 0 
                                ? (item.faltas / item.maxFaltas) * maxBarHeight 
                                : 0
                            const status = item.porcentaje >= 100 ? 'red' : item.porcentaje >= 80 ? 'amber' : 'emerald'
                            
                            return (
                                <div key={item.id} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-300 truncate flex-1 mr-2">{item.nombre}</span>
                                        <span className={`font-semibold ${status === 'red' ? 'text-red-400' : status === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            {item.faltas}/{item.maxFaltas}
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-900/50 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                status === 'red'
                                                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                    : status === 'amber'
                                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                            }`}
                                            style={{ width: `${Math.min(item.porcentaje, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Pie Chart Representation */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-6">
                        <PieChart className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-white">Distribución de Estado</h3>
                    </div>
                    <div className="space-y-6">
                        {/* Status Breakdown */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    <span className="text-white font-medium">En Buen Estado</span>
                                </div>
                                <span className="text-emerald-400 font-bold">{statusCount.safe}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-400" />
                                    <span className="text-white font-medium">En Riesgo</span>
                                </div>
                                <span className="text-amber-400 font-bold">{statusCount.warning}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <span className="text-white font-medium">Límite Alcanzado</span>
                                </div>
                                <span className="text-red-400 font-bold">{statusCount.danger}</span>
                            </div>
                        </div>

                        {/* Progress Ring */}
                        <div className="flex items-center justify-center">
                            <div className="relative w-48 h-48">
                                <svg className="transform -rotate-90 w-48 h-48">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        stroke="currentColor"
                                        strokeWidth="16"
                                        fill="transparent"
                                        className="text-gray-800"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        stroke="currentColor"
                                        strokeWidth="16"
                                        fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 80}`}
                                        strokeDashoffset={`${2 * Math.PI * 80 * (1 - porcentajeGeneral / 100)}`}
                                        className="text-blue-500 transition-all duration-1000"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-white">{porcentajeGeneral.toFixed(0)}%</p>
                                        <p className="text-sm text-gray-400">Total</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-white">Detalle por Asignatura</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700/50">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Asignatura</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Horas</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Faltas</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Máximo</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Restantes</th>
                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asignaturasConDatos.map((item) => {
                                const status = item.porcentaje >= 100 ? 'red' : item.porcentaje >= 80 ? 'amber' : 'emerald'
                                const statusLabel = item.porcentaje >= 100 ? 'Límite' : item.porcentaje >= 80 ? 'Riesgo' : 'Bien'
                                
                                return (
                                    <tr key={item.id} className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors">
                                        <td className="py-4 px-4 text-white font-medium">{item.nombre}</td>
                                        <td className="py-4 px-4 text-center text-gray-300">{item.horas}h</td>
                                        <td className="py-4 px-4 text-center text-white font-semibold">{item.faltas}</td>
                                        <td className="py-4 px-4 text-center text-gray-400">{item.maxFaltas}</td>
                                        <td className={`py-4 px-4 text-center font-semibold text-${status}-400`}>
                                            {Math.max(0, item.maxFaltas - item.faltas)}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold bg-${status}-500/10 text-${status}-400 border border-${status}-500/20`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

