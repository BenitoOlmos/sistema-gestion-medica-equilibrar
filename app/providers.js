'use client';

import { AppProvider } from '@/lib/context';

export function Providers({ children }) {
    return <AppProvider>{children}</AppProvider>;
}
