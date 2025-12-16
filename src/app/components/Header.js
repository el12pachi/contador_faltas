'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Header({ title, subtitle }) {
    const { theme } = useTheme();
    
    return (
        <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${
            theme === 'dark'
                ? 'bg-black/30 border-white/10'
                : 'bg-white/80 border-black/10'
        }`}>
            <div className="ml-64 px-8 py-4">
                <div>
                    <h1 className={`text-2xl font-medium tracking-tight mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`} style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p className={`text-sm font-normal ${
                            theme === 'dark' ? 'text-white/40' : 'text-gray-500'
                        }`}>{subtitle}</p>
                    )}
                </div>
            </div>
        </header>
    );
}

