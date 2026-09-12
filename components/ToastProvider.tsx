'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error' | '';

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        // Throw an error if the hook is used outside the provider
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toast, setToast] = useState({ show: false, message: '', type: '' as ToastType });

    const showToast = (message: string, type: ToastType) => {
        setToast({ show: true, message, type });
        
        // Auto hide the toast after 3 seconds
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            
            {/* Toast UI Component */}
            {toast.show && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
                    <div className={`text-white text-center py-3 px-4 rounded-md shadow-lg font-bold transition-all duration-300 ${
                        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                        {toast.message}
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};