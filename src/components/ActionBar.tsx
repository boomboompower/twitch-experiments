import {Button} from '@headlessui/react';
import {useActionBar} from '../contexts/ActionBarDialogProvider';

export function ActionBar() {
    const { openImportDialog, openExportDialog, openResetDialog } = useActionBar();

    return (
        <div className="w-full flex gap-2 justify-center flex-col mb-2 lg:w-auto">
            <Button
                onClick={openImportDialog}
                className={'w-full bg-tw text-white text-sm font-semibold py-1 px-3 rounded-md transition'}>
                Import
            </Button>
            <Button
                onClick={openExportDialog}
                className="w-full bg-export text-white text-sm font-semibold py-1 px-3 rounded-md transition">
                Export
            </Button>
            <Button
                onClick={openResetDialog}
                className="w-full bg-reset text-white text-sm font-semibold py-1 px-3 rounded-md transition">
                Reset
            </Button>
        </div>
    )
}
