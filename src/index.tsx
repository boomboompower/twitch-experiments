import './index.css'
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HolidaySeasons } from './components/HolidaySeasons';
import { ExperimentOverridesProvider } from './contexts/ExperimentOverridesProvider';
import { ActionBarDialogProvider } from './contexts/ActionBarDialogProvider';
import { SortBarProvider } from './contexts/SortBarProvider';
import { HomePage } from './pages/HomePage';
import { PageNotFound } from './pages/PageNotFound';

// This is the main entry point for the application.
function App() : React.ReactElement  {
    return (
        <HolidaySeasons>
            <PageNotFound>
                <ExperimentOverridesProvider>
                    <ActionBarDialogProvider>
                        <SortBarProvider>
                            <HomePage/>
                        </SortBarProvider>
                    </ActionBarDialogProvider>
                </ExperimentOverridesProvider>
            </PageNotFound>
        </HolidaySeasons>
    );
}

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
