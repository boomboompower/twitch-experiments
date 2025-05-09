import React, {ReactElement, useEffect} from 'react';
import {NotFound} from '../components/NotFound';

type PageNotFoundProps = {
    children: ReactElement;
}

export function PageNotFound({children}: PageNotFoundProps) {
    // Detect any 404 errors and redirect to the 404 page
    const [isFound, setIsFound] = React.useState(true);
    const [hasBeenChecked, setIsChecked] = React.useState(false);

    useEffect(() => {
        const path = window.location.pathname;
        const allowedPaths = ['/', '/tecg/', '/tecg'];
        const isAllowedPath = allowedPaths.some(allowedPath => path === allowedPath);

        if (!isAllowedPath) {
            setIsFound(false);
        }

        setIsChecked(true);
    }, []);

    // Check if the current path is allowed
    if (!hasBeenChecked) {
        return <div className="flex flex-col items-center justify-center items-center h-screen bg-gray-800 text-gray-200">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <div className="text-lg mt-4">Loading</div>
        </div>;
    }

    if (!isFound) {
        return <NotFound />;
    }

    return children;
}
