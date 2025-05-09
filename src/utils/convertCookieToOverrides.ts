import {CollatedExperiment} from '../hooks/useExperiments';

export function convertCookieToOverrides(
    cookie: string,
    experiments: CollatedExperiment[],
): Record<string, string> | null {
    if (!cookie || cookie.length === 0) {
        console.error('Empty cookie string provided');

        return null;
    }

    // Parse the cookie string to get the overrides
    const parsedCookie = decodeURIComponent(cookie)
        .replace(/%20/g, ' ')
        .replace(/%22/g, '"')
        .replace(/%2C/g, ',');

    // First check the format of the cookie
    // If the cookie is not in the correct format, return an empty string
    if (!parsedCookie.startsWith('{"experiments":')) {
        console.error('Invalid cookie format:', parsedCookie);

        return null;
    }

    // Create an object to hold the overrides
    const overrides: Record<string, string> = {};

    try {
        // Format is as follows:
        // {"experiments":{"experimentID":"experimentOverride"},"disabled":["experimentID"]}
        const parsedOverrides: {
            experiments: Record<string, string>;
            disabled: string[];
        } = JSON.parse(parsedCookie);

        // Iterate through the experiments and add them to the overrides object
        // Ensure that the override exists in the experiments object. We need to set
        // The experiment name as the key and the override as the value
        for (const [experimentID, override] of Object.entries(parsedOverrides.experiments)) {
            // Find the ID of the experiment in the experiments object.
            const experiment = experiments.find((experiment) => {
                return experiment.id === experimentID;
            });

            if (experiment) {
                overrides[experiment.name] = override;
            } else {
                console.warn(`Experiment ID ${experimentID} not found in experiments object`);
            }
        }
    } catch (error) {
        console.error('Error parsing cookie:', error);
        return null;
    }

    return overrides;
}
