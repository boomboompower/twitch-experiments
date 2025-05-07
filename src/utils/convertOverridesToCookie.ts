import {ExperimentHolder} from '../hooks/useExperiments';

export function convertOverridesToCookie(
    overrides: Record<string, string>,
    experiments: ExperimentHolder,
): string {
    const temporaryObject = {
        experiments: {} as { [key: string]: string },
        disabled: [] as string[],
    }

    for (const exp of Object.keys(overrides)) {
        // Find the ID of the experiment in the experiments object. The ID is the key of the object.
        // Our stored value is the name of the experiment, so we need to find the ID of the experiment in the experiments object.
        // Then we can use that ID to get the experiment object from the experiments object.
        const experimentID = Object.keys(experiments).find((key) => {
            return experiments[key].name === exp;
        });

        temporaryObject.experiments[experimentID] = overrides[exp];
    }

    return JSON.stringify(temporaryObject)
        .replace(/ /g, '%20')
        .replace(/"/g, '%22')
        .replace(/,/g, '%2C');
}
