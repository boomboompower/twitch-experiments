import {createContext, ReactNode, useContext, useState} from 'react';

type SortBarContextType = {
    sortBy: SortByType;
    setSortBy: (sortBy: SortByType) => void;
}

export type SortByType = 'name' | 'discovery-newest' | 'discovery-oldest';

export const SortBarContext = createContext<SortBarContextType | undefined>(undefined);

export const SortBarProvider = ({ children }: { children: ReactNode }) => {
    const [sortBy, setSortBy] = useState<SortByType>('name');

    return (
        <SortBarContext.Provider value={{ sortBy, setSortBy }}>
            {children}
        </SortBarContext.Provider>
    );
};

export const useSortBar = () => {
    const context = useContext(SortBarContext);
    if (!context) {
        throw new Error('useSortBar must be used within a SortBarProvider');
    }
    return context;
}
