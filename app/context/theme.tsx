"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Helper function to get initial theme preference
const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
            return storedTheme;
        }
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'dark' : 'light';
    }
    return 'light'; // Default theme for server-side rendering or if window is unavailable
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize state without calling getInitialTheme directly
    // Initialize state with a default theme, getInitialTheme will correct it on client mount
    const [theme, setThemeState] = useState<Theme>('light');

    // Effect to set initial theme on client-side mount
    useEffect(() => {
        setThemeState(getInitialTheme());
    }, []); // Empty dependency array ensures this runs only once on mount

    // Effect to apply theme class and save preference when theme changes
    useEffect(() => {
        // Only run if theme is set (not null) and window is available
        if (theme && typeof window !== 'undefined') {
            const root = window.document.documentElement;
            const isDark = theme === 'dark';

            root.classList.remove(isDark ? 'light' : 'dark');
            root.classList.add(theme);

            localStorage.setItem('theme', theme);
        }
    }, [theme]); // Run this effect when theme changes

    // Function to set theme directly
    const setTheme = useCallback((newTheme: Theme) => {
        if (newTheme === 'light' || newTheme === 'dark') {
            setThemeState(newTheme);
        }
    }, []);

    // Function to toggle theme
    const toggleTheme = useCallback(() => {
        setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);

    // Memoize context value
    // Memoize context value, ensuring theme is not null before creating
    // Memoize context value. Theme is guaranteed to be 'light' or 'dark'.
    const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};