import { CheckCircleIcon, StopIcon } from '@heroicons/react/24/solid';

interface ExperimentIconProps {
    isChecked: boolean;
    className?: string;
}

/**
 * ExperimentIcon component to display an icon based on the experiment state.
 *
 * @param isChecked boolean - Indicates if the icon is checked
 * @param className string - Additional class names to apply to the icon
 */
export function ExperimentIcon({ isChecked, className }: ExperimentIconProps) {
    const classList = ['size-6', 'transition', 'fill-blue-500'];

    // Set the icon color based on the state
    if (isChecked) {
        classList.push('opacity-100');
    } else {
        classList.push('opacity-30');
    }

    // Force append className to be an array
    if (className) {
        classList.push(className);
    }

    return isChecked ?
        <CheckCircleIcon className={classList.join(' ')} /> :
        <StopIcon className={classList.join(' ')} />;
}
