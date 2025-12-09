'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from 'next/navigation';

// Función para obtener mensajes de error descriptivos
function getErrorMessage(error) {
    const errorMessages = {
        'Configuration': 'Error de configuración de Google OAuth. Por favor, contacta al administrador.',
        'OAuthCallback': 'Problema con el Redirect URI. Verifica la configuración de OAuth.',
        'OAuthSignin': 'Error al iniciar sesión con Google. Intenta nuevamente.',
        'OAuthAccountNotLinked': 'Esta cuenta de Google ya está vinculada a otro usuario.',
        'EmailSignin': 'Error al enviar el correo de verificación.',
        'CredentialsSignin': 'Las credenciales proporcionadas no son válidas.',
        'SessionRequired': 'Debes iniciar sesión para acceder a esta página.',
        'AccessDenied': 'Acceso denegado. No tienes permisos para acceder.',
        'Verification': 'El token de verificación ha expirado o no es válido.',
        'Default': 'Ocurrió un error durante la autenticación. Por favor, intenta nuevamente.'
    };

    return errorMessages[error] || errorMessages['Default'];
}

function LoginContent() {
    const callbackUrl = '/';
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);

    // Captura errores desde la URL (NextAuth redirige con parámetros de error)
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            console.error('[Login] Error detectado en URL:', errorParam);
            console.error('[Login] Parámetros completos:', Object.fromEntries(searchParams.entries()));
            setError(getErrorMessage(errorParam));
            
            // Limpiar el parámetro de error de la URL sin recargar la página
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [searchParams]);

    // Cleanup del timeout cuando el componente se desmonte
    useEffect(() => {
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [timeoutId]);

    const login = async () => {
        setIsLoading(true);
        setError(null);

        // Limpiar timeout anterior si existe
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Timeout de seguridad: 30 segundos
        const timeout = setTimeout(() => {
            console.error('[Login] Timeout: El proceso de autenticación tardó más de 30 segundos');
            setError('El proceso de autenticación está tardando demasiado. Por favor, verifica tu conexión e intenta nuevamente.');
            setIsLoading(false);
        }, 30000);

        setTimeoutId(timeout);

        try {
            console.log('[Login] Iniciando proceso de autenticación con Google...');
            console.log('[Login] Callback URL:', callbackUrl);
            
            const result = await signIn("google", {
                callbackUrl,
                redirect: true
            });

            // Limpiar timeout si el proceso completó
            clearTimeout(timeout);
            setTimeoutId(null);

            if (result?.error) {
                console.error('[Login] Error de inicio de sesión:', result.error);
                console.error('[Login] Detalles del error:', result);
                setError(getErrorMessage(result.error));
                setIsLoading(false);
            } else {
                console.log('[Login] Autenticación exitosa, redirigiendo...');
                router.push(callbackUrl);
            }

        } catch (error) {
            // Limpiar timeout en caso de error
            clearTimeout(timeout);
            setTimeoutId(null);
            
            console.error('[Login] Error durante la autenticación:', error);
            console.error('[Login] Stack trace:', error.stack);
            console.error('[Login] Tipo de error:', error.constructor.name);
            setError('Ocurrió un error inesperado durante la autenticación. Por favor, intenta nuevamente.');
            setIsLoading(false);
        }
    };

    const closeError = () => {
        setError(null);
    };

    return (
        <div className="min-h-screen bg-[#fbfbfd] dark:bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Alerta de error */}
                {error && (
                    <div 
                        className="mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-600 rounded-xl p-4 animate-fadeIn"
                        role="alert"
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg 
                                    className="h-5 w-5 text-red-600 dark:text-red-400" 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                >
                                    <path 
                                        fillRule="evenodd" 
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                        clipRule="evenodd" 
                                    />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                    {error}
                                </p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                <button
                                    onClick={closeError}
                                    className="inline-flex text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md p-1"
                                    aria-label="Cerrar alerta"
                                >
                                    <svg 
                                        className="h-5 w-5" 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor"
                                    >
                                        <path 
                                            fillRule="evenodd" 
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                                            clipRule="evenodd" 
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-[#1d1d1f] rounded-3xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
                    <div className="px-10 py-12 text-center border-b border-gray-200/50 dark:border-gray-800/50">
                        <div className="mb-8">
                            <div className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                                Contador de Faltas
                            </div>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-semibold mb-3 text-gray-900 dark:text-white tracking-tight">
                            Bienvenido
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Gestiona tu asistencia de forma inteligente
                        </p>
                    </div>

                    <div className="p-10">
                        <button
                            onClick={login}
                            disabled={isLoading}
                            className={`group relative w-full bg-white dark:bg-[#1d1d1f] hover:bg-gray-50 dark:hover:bg-[#2d2d2f] border border-gray-300 dark:border-gray-700 rounded-xl px-6 py-4 text-gray-900 dark:text-white font-medium transition-all duration-200 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-3">
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Iniciando sesión...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span>Continuar con Google</span>
                                    </>
                                )}
                            </div>
                        </button>

                        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-6 leading-relaxed">
                            Al continuar, aceptas nuestros{' '}
                            <span className="text-[#0071e3] dark:text-[#0a84ff] cursor-pointer hover:underline">
                                Términos de Servicio
                            </span>{' '}
                            y{' '}
                            <span className="text-[#0071e3] dark:text-[#0a84ff] cursor-pointer hover:underline">
                                Política de Privacidad
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente principal con Suspense boundary
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#fbfbfd] dark:bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

