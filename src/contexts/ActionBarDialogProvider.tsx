import React, { createContext, useContext, useState } from 'react';
import { useExperimentOverrides } from './ExperimentOverridesProvider';
import {Button, Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle, Textarea} from '@headlessui/react';
import {useExperiments} from '../hooks/useExperiments';
import {convertOverridesToCookie} from '../utils/convertOverridesToCookie';
import {convertCookieToOverrides} from '../utils/convertCookieToOverrides';

type DialogContent = {
    title: string;
    description?: string;
    content: React.ReactNode;
}

interface ActionBarContextProps {
    openImportDialog: () => void;
    openExportDialog: () => void;
    openResetDialog: () => void;
    closeDialog: () => void;
    isDialogOpen: boolean;
    dialogContent: DialogContent | null;
}

const ActionBarContext = createContext<ActionBarContextProps | undefined>(undefined);

export const ActionBarDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { overrides, clearOverrides, overrideOverrides } = useExperimentOverrides();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState<DialogContent>(null);
    const { experiments } = useExperiments();

    const openImportDialog = () => {
        setDialogContent({
            content: (
                <div>
                    <Textarea
                        className="w-full mt-2 p-2 border rounded-md h-48 resize-none bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder='{%22experiments%22:{}%2C%22disabled%22:[]}'
                        id={'cookie-input'}
                    />
                    <Button
                        className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-md"
                        onClick={(event) => {
                            const input = document.getElementById('cookie-input') as HTMLTextAreaElement;
                            const cookie = input.value;

                            // Convert the cookie to overrides
                            const newOverrides = convertCookieToOverrides(cookie, experiments);

                            if (!newOverrides) {
                                // Show an error with a cross saying it failed
                                event.currentTarget.innerText = '✗ Failed!';
                                event.currentTarget.setAttribute('disabled', 'true');
                                event.currentTarget.style.pointerEvents = 'none';

                                setTimeout(() => {
                                    closeDialog();
                                }, 1000);
                                return;
                            } else {
                                overrideOverrides(newOverrides);
                            }

                            // Update the button text to indicate success
                            event.currentTarget.innerText = '✓ Imported!';
                            event.currentTarget.setAttribute('disabled', 'true');
                            event.currentTarget.style.pointerEvents = 'none';
                            setTimeout(() => {
                                closeDialog();
                            }, 1000);
                        }}
                    >
                        Import Overrides
                    </Button>
                </div>
            ),
            description: 'Paste your override JSON here to import.',
            title: 'Import Overrides',
        });
        setIsDialogOpen(true);
    };

    const openExportDialog = () => {
        const cookie = convertOverridesToCookie(overrides, experiments);

        setDialogContent({
            content: (
                <div>
                    <Textarea
                        className="w-full mt-2 p-2 border rounded-md h-48 resize-none bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                        value={cookie}
                    />
                    <Button
                        className="w-full mt-3 bg-green-500 text-white px-4 py-2 rounded-md"
                        onClick={(event) => {
                            navigator.clipboard.writeText(cookie).then(() => {
                                console.log('Copied to clipboard');
                            });

                            event.currentTarget.innerText = '✓ Copied!';
                            event.currentTarget.setAttribute('disabled', 'true');
                            event.currentTarget.style.pointerEvents = 'none';

                            setTimeout(() => {
                                closeDialog()
                            }, 1000);
                        }}
                    >
                        Copy to Clipboard
                    </Button>
                </div>
            ),
            description: 'Copy the JSON below to export your overrides.',
            title: 'Export Overrides',
        });
        setIsDialogOpen(true);
    };

    const openResetDialog = () => {
        const overriddenExperiments = Object.keys(overrides);
        setDialogContent({
            content: (
                <div>
                    <p className="text-sm text-gray-400">
                        Are you sure you want to reset all overrides? This action cannot be undone.
                    </p>
                    {overriddenExperiments.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-gray-300">
                            {overriddenExperiments.map((experiment) => (
                                <li key={experiment}>{experiment}</li>
                            ))}
                        </ul>
                    )}
                    <Button
                        className={'mt-3 w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 float-end'}
                        onClick={(e) => {
                            clearOverrides();
                            // Update the text to a tick icon or similar
                            e.currentTarget.innerText = '✓';
                            e.currentTarget.setAttribute('disabled', 'true');
                            e.currentTarget.style.pointerEvents = 'none';

                            setTimeout(() => {
                                closeDialog();
                            }, 1000);
                        }}
                    >
                        Reset Overrides
                    </Button>
                </div>
            ),
            description: 'This action will reset all overrides to their default values.',
            title: 'Reset Overrides',
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    return (
        <ActionBarContext.Provider
            value={{
                openImportDialog,
                openExportDialog,
                openResetDialog,
                closeDialog,
                isDialogOpen,
                dialogContent,
            }}
        >
            {children}
            <Dialog
                open={isDialogOpen}
                onClose={closeDialog}
                transition
                className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-closed:opacity-0"
            >
                <DialogBackdrop className="fixed inset-0 bg-black/30" />
                <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className='w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0'
                    >
                        <DialogTitle as="h3" className="text-lg font-semibold text-white">
                            {dialogContent?.title}
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
                                onClick={closeDialog}
                            >
                                &times;
                            </button>
                        </DialogTitle>
                        <Description className="mt-2 text-sm text-gray-400">
                            {dialogContent?.description}
                        </Description>
                        <div className="overflow-y-auto">
                            {dialogContent?.content}
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </ActionBarContext.Provider>
    );
};

export const useActionBar = () => {
    const context = useContext(ActionBarContext);
    if (!context) {
        throw new Error('useActionBar must be used within a ActionBarDialogProvider');
    }
    return context;
};
