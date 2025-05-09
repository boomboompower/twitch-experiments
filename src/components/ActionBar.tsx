import {useMemo} from 'react';
import {Button} from '@headlessui/react';
import {useActionBar} from '../contexts/ActionBarDialogProvider';
import {useExperimentOverrides} from '../contexts/ExperimentOverridesProvider';

export function ActionBar() {
    const { openImportDialog, openExportDialog, openResetDialog } = useActionBar();
    const { overrides } = useExperimentOverrides()

    const overrideCount = useMemo(() => {
        return Object.keys(overrides).length;
    }, [overrides]);

    return (
        <div className="w-full flex gap-2 justify-center flex-col mb-2 lg:w-auto">
            <Button
                aria-label={'Import an override from clipboard'}
                onClick={openImportDialog}
                className={'w-full bg-tw text-white text-sm font-semibold py-1 px-3 rounded-md transition'}>
                Import
            </Button>
            <Button
                aria-label={'Export overrides to clipboard'}
                onClick={openExportDialog}
                className="w-full bg-export text-white text-sm font-semibold py-1 px-3 rounded-md transition">
                Export
            </Button>
            <Button
                aria-label={'Reset all experiment overrides'}
                disabled={overrideCount === 0}
                onClick={openResetDialog}
                className="w-full bg-reset text-white text-sm font-semibold py-1 px-3 rounded-md transition disabled:text-white/50">
                {overrideCount > 0 ? 'Reset' : 'No Overrides'}
            </Button>
        </div>
    )
}
