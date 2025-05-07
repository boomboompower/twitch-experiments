
export function formatDate(date: string) {
    if (!date) return 'Unknown';
    try {
        const options: Intl.DateTimeFormatOptions = {
            dateStyle: 'long',
            timeStyle: 'short',
            'hour12': true,
            timeZone: 'UTC',
        };
        const formattedDate = new Date(date)

        // Experiments found before we started tracking them
        if (formattedDate.getUTCDate() === 15 && formattedDate.getUTCMonth() === 5 && formattedDate.getUTCFullYear() === 2022) {
            return 'Before June 15, 2022';
        }

        return formattedDate.toLocaleString('en-GB', options);
    } catch (e) {
        console.error('Error formatting date:', e);
    }
    return date;
}
