'use client';

import React, { useEffect, useState } from 'react';
import {
    Book, BookOpen, ChevronDown, ChevronUp,
    CodeSquare
} from 'lucide-react';

export default function Asignaturas() {
    const [memoria, setMemoria] = useState([])
    const [expanded, setExpanded] = useState(new Set())
    const [listAsignaturas, setListAsignaturas] = useState([
        {
            id: 1,
            nombre: "Sistemas informáticos",
            horas: 167,
            color: "from-purple-500 to-blue-500",
            faltas: 0
        },
        {
            id: 2,
            nombre: "Bases de Datos",
            horas: 200,
            color: "from-green-500 to-teal-500",
            faltas: 0
        },
        {
            id: 3,
            nombre: "Programación",
            horas: 267,
            color: "from-yellow-500 to-orange-500",
            faltas: 0
        },
        {
            id: 4,
            nombre: "Lenguajes de marcas y sistemas de gestión de información",
            horas: 67,
            color: "from-red-500 to-pink-500",
            faltas: 0
        },
        {
            id: 5,
            nombre: "Entornos de desarrollo",
            horas: 100,
            color: "from-indigo-500 to-purple-500",
            faltas: 0
        },
        {
            id: 6,
            nombre: "Itinerario personal para la empleabilidad I",
            horas: 100,
            color: "from-gray-500 to-blue-500",
            faltas: 0
        },
        {
            id: 7,
            nombre: "Digitalización aplicada a los sectores productivos (GS)",
            horas: 33,
            color: "from-blue-500 to-green-500",
            faltas: 0
        },
        {
            id: 8,
            nombre: "Inglés profesional",
            horas: 67,
            color: "from-pink-500 to-red-500",
            faltas: 0
        }
    ]);
    useEffect(() => {
        const data = localStorage.getItem('asignaturas')
        if (data) {
            setMemoria(JSON.parse(data))
        } else {
            localStorage.setItem('asignaturas', JSON.stringify(memoria))
        }
    }, [])

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
        setMemoria({ ...memoria, [id]: memoria[id] ? ++memoria[id] : 1 });
        localStorage.setItem('asignaturas', JSON.stringify(memoria))
    }

    const removeFalta = (id) => {
        if (memoria[id] > 0) {
            setMemoria({ ...memoria, [id]: memoria[id] ? --memoria[id] : 0 });
            localStorage.setItem('asignaturas', JSON.stringify(memoria))
        }
    }

    const porcentajeHoras = () => {
        let faltas = allfatas()
        return faltas = faltas == 0 ? 0 : (faltas * 100) / listAsignaturas.reduce((total, data) => total + data.horas, 0)
    }

    const allfatas = () => {
        let sum = 0
        for (const value in memoria) {
            sum += memoria[value]
        }
        return sum
    }

    const faltas = (id) => {
        return memoria[id] ? memoria[id] : 0
    }

    return (
        <div className="min-h-screen bg-gray-900 p-3 sm:p-6">
            {/* <div className="max-w-2xl mx-auto"> */}
            <div className="felx flex-col space-y-6 max-w-[600px] items-center mx-auto">
                <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                    <Book className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                    <h1 className="text-2xl sm:text-4xl font-bold text-white">Asignaturas</h1>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {listAsignaturas.map((data) => (
                        <div
                            key={data.id}
                            className="rounded-xl bg-gray-800 border border-gray-700 p-3 sm:p-4"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${data.color} flex items-center justify-center flex-shrink-0`}>
                                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm sm:text-lg font-semibold text-white truncate">{data.nombre}</h3>
                                        <p className="text-xs sm:text-base text-gray-400">
                                            {data.horas} horas totales
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 sm:space-x-4 ml-2">
                                    <div className="text-right">
                                        <p className="text-xs sm:text-sm text-gray-400">Faltas</p>
                                        <p className="text-white font-semibold">
                                            {faltas(data.id)}
                                        </p>
                                    </div>
                                    <div className="flex rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => removeFalta(data.id)}
                                            className="p-2.5 sm:p-2 bg-gray-600 border border-gray-700 hover:bg-gray-500"
                                        >
                                            <span className="text-white">-</span>
                                        </button>
                                        <button
                                            onClick={() => addFalta(data.id)}
                                            className="p-2.5 sm:p-2 bg-gray-600 border border-gray-700 hover:bg-gray-500"
                                        >
                                            <span className="text-white">+</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => subMenu(data.id)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        {expanded.has(data.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className={`mt-4 bg-gray-700 rounded-lg p-3 space-y-3 ${expanded.has(data.id) ? 'block' : 'hidden'}`} id={data.id}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-400">Horas totales</p>
                                        <p className="text-white font-semibold">{data.horas} horas</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Horas semanales</p>
                                        <p className="text-white font-semibold">{Math.trunc(data.horas / 33)} horas</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Horas que puede faltar</p>
                                        <p className="text-white font-semibold">
                                            {Math.trunc((data.horas * 0.15))} horas ({faltas(data.id)} faltas)
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Máximo de faltas permitido</p>
                                        <p className="text-white font-semibold">
                                            {Math.trunc(data.horas * 0.15) - faltas(data.id)} horas
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400 mb-1">Progreso de faltas</p>
                                    <div className="w-full bg-gray-600 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${faltas(data.id) >= (data.horas * 0.15)
                                                ? 'bg-red-500'
                                                : 'bg-green-500'
                                                }`}
                                            style={{
                                                width: `${Math.min((faltas(data.id) / (data.horas * 0.15)) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700 w-full h-auto">
                    <h3 className="text-xl font-semibold text-white mb-2">Resumen de Faltas</h3>
                    <div className="flex flex-col sm:flex-row gap-4 h-auto">{/* Arreglar */}
                        <div className="bg-gray-700 p-3 rounded-lg  w-full sm:w-[50%]">
                            <p className="text-gray-300">Total de horas faltadas:</p>
                            <p className="text-2xl font-bold text-white">
                                {allfatas()}
                            </p>
                        </div>
                        <div className="bg-gray-700 p-3 rounded-lg w-full sm:w-[50%]">
                            <p className="text-gray-300 ">Porcentaje de faltas:</p>
                            <p className="text-2xl font-bold text-white">
                                {(porcentajeHoras()).toFixed(2)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}