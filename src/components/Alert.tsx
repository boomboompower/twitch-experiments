import {ReactNode} from 'react';

import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

type AlertProps = {
    children: ReactNode;
    id?: string;
    className?: string;
}

/**
 * Display an alert message with a warning icon. Mainly used as a big warning sign.
 *
 * @param {ReactNode} children - The content to be displayed inside the alert.
 * @param {string} id - Optional id for the alert element.
 * @param {string} className - Optional additional class names for styling.
 */
export function Alert({children, id, className}: AlertProps) {
    return (
        <div
            className={`rounded-md bg-red-700 text-white p-4 ${className}`}
            aria-label={'Alert'}
            aria-describedby={id}
            role="alert"
            id={id}
        >
            <div className="flex ">
                <div className="flex-shrink-0 self-center">
                    <ExclamationTriangleIcon className='size-6 text-yellow-400' />
                </div>
                <div className="ml-3">
                    {children}
                </div>
            </div>
        </div>
    );
}
