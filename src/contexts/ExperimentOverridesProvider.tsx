import React, { createContext, useContext, useState, ReactNode } from 'react';

type ExperimentOverridesContextType = {
    overrides: Record<string, string>;
    overrideOverrides: (overrides: Record<string, string>) => void;
    setOverride: (id: string, overrideName: string) => void;
    removeOverride: (id: string) => void;
    clearOverrides: () => void;
};

const ExperimentOverridesContext = createContext<ExperimentOverridesContextType | undefined>(undefined);

export const ExperimentOverridesProvider = ({ children }: { children: ReactNode }) => {
    const [overrides, setOverrides] = useState<Record<string, string>>(() => {
        // Retrieve the overrides from local storage
        // Try and parse the stored overrides, and validate them
        const storedOverrides = localStorage.getItem('experimentOverrides');
        if (storedOverrides) {
            try {
                const parsedOverrides = JSON.parse(storedOverrides);
                if (typeof parsedOverrides === 'object' && parsedOverrides !== null) {
                    return parsedOverrides;
                }
            } catch (error) {
                console.error('Error parsing stored overrides:', error);
            }
        }
        return {};
    });

    const setOverride = (id: string, overrideName: string) => {
        setOverrides((prev) => ({ ...prev, [id]: overrideName }));

        // Store the overrides in local storage
        localStorage.setItem('experimentOverrides', JSON.stringify({ ...overrides, [id]: overrideName }));
    };

    const removeOverride = (id: string) => {
        setOverrides((prev) => {
            const newOverrides = { ...prev };
            delete newOverrides[id];
            return newOverrides;
        });

        // Update local storage
        const updatedOverrides = { ...overrides };
        delete updatedOverrides[id];
        localStorage.setItem('experimentOverrides', JSON.stringify(updatedOverrides));
    };

    const clearOverrides = () => {
        setOverrides({});

        // Clear local storage
        localStorage.removeItem('experimentOverrides');
    };

    const overrideOverrides = (overrides: Record<string, string>) => {
        setOverrides(overrides);
        localStorage.setItem('experimentOverrides', JSON.stringify(overrides));
    }

    return (
        <ExperimentOverridesContext.Provider value={{ overrides, setOverride, removeOverride, clearOverrides, overrideOverrides }}>
            {children}
        </ExperimentOverridesContext.Provider>
    );
};

export const useExperimentOverrides = (): ExperimentOverridesContextType => {
    const context = useContext(ExperimentOverridesContext);
    if (!context) {
        throw new Error('useExperimentOverrides must be used within an ExperimentOverridesProvider');
    }
    return context;
};
