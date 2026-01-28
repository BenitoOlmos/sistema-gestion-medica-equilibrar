'use client';

import { AppProvider } from '@/lib/context';
import { ToastProvider } from '@/lib/toast';

export function Providers({ children }) {
    return (
        <ToastProvider>
            <AppProvider>{children}</AppProvider>
        </ToastProvider>
    );
}
