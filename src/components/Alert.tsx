import {ReactNode} from 'react';

import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

type AlertProps = {
    children: ReactNode;
    id?: string;
    className?: string;
}

export function Alert({children, id, className}: AlertProps) {
    return (
        <div
            className={`rounded-md bg-red-700 text-white p-4 ${className}`}
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
