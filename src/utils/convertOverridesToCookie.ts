import {CollatedExperiment} from '../hooks/useExperiments';

export function convertOverridesToCookie(
    overrides: Record<string, string>,
    experiments: CollatedExperiment[],
): string {
    const temporaryObject = {
        experiments: {} as { [key: string]: string },
        disabled: [] as string[],
    }

    for (const exp of Object.keys(overrides)) {
        // Find the ID of the experiment in the experiments object.
        const experimentID = experiments.find((experiment) => {
            return experiment.name === exp;
        })?.id;

        if (!experimentID) {
            console.warn(`Experiment ${exp} not found in experiments object`);
            continue;
        }

        temporaryObject.experiments[experimentID] = overrides[exp];
    }

    return JSON.stringify(temporaryObject)
        .replace(/ /g, '%20')
        .replace(/"/g, '%22')
        .replace(/,/g, '%2C');
}
