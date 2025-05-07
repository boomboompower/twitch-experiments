interface PillProps {
    label: string;
    className?: string;
    type?: 'default' | 'staff';
}

/**
 * Pill component to display a label with a background color.
 *
 * @param label string - The label to display
 * @param className string - Additional class names to apply to the pill
 */
export function Pill({ label, className }: PillProps) {
    return (
        <span
            className={`inline-block rounded-full ${
                label === 'Staff Default'
                    ? 'bg-yellow-600'
                    : label === 'Default'
                    ? 'bg-blue-600'
                    : 'bg-black/20'
            } mx-2 px-2 py-1 text-xs font-medium text-white transition ${className || ''}`}
        >
            {label}
        </span>
    );
}
