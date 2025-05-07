import React from 'react';
import './index.css'
import { createRoot } from 'react-dom/client';
import {Applet} from './components/Applet';
import {ExperimentOverridesProvider} from './contexts/ExperimentOverridesProvider';
import {ActionBarDialogProvider} from './contexts/ActionBarDialogProvider';
import {SortBarProvider} from './contexts/SortBarProvider';

function App() : React.ReactElement  {
    return (
        <ExperimentOverridesProvider>
            <ActionBarDialogProvider>
                <SortBarProvider>
                    <Applet/>
                </SortBarProvider>
            </ActionBarDialogProvider>
        </ExperimentOverridesProvider>
    );
}

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
