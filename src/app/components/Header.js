'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';

export default function Header({ title, subtitle }) {
    return (
        <header className="sticky top-0 z-30 bg-gray-900/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 dark:border-gray-700/50">
            <div className="ml-64 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
                        {subtitle && (
                            <p className="text-sm text-gray-400">{subtitle}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

