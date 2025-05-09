import { useEffect, useState } from 'react';

import experimentsImport from '../data/experiments.json';

/**
 * The CollatedExperiment type represents a collated experiment object.
 *
 * It contains the following properties:
 * - id: The unique identifier of the experiment.
 * - name: The name of the experiment.
 * - groups: An array of groups associated with the experiment, each containing:
 *    - value: The value of the group, which represents the specific variant of the experiment.
 *    - weight: The weight of the group, which determines its probability of being selected.
 * - active: A boolean indicating if the experiment is currently active.
 * - hasBeenActive: A boolean indicating if the experiment has been active in the past.
 * - servingOne: A boolean indicating if the experiment is currently being served to one group.
 * - default: The default group for the experiment.
 * - dateFound: The date the experiment was added.
 * - dateActivated: The date the experiment was activated.
 * - dateDeactivated: The date the experiment was deactivated.
 * - staffOverride: An optional field that indicates if there is a staff override for the experiment.
 */
export type CollatedExperiment = {
    id: string,                    // For example: "e2a55f6e-0226-41c2-8320-a1a4abf7c611"
    name: string,                  // For example: "twitch-experiment"
    groups: {
        value: string,             // For example: "control"
        weight: number,            // For example: 0.5
    }[],
    active: boolean,               // If the experiment is currently active
    hasBeenActive: boolean,        // If the experiment has been active in the past
    servingOne: boolean,           // If the experiment is currently serving one group
    default: string,               // For example: "control"
    dateFound?: string,            // The date the experiment was added
    dateActivated?: string,        // The date the experiment was added
    dateDeactivated?: string,      // The date the experiment was removed
    staffOverride?: string,        // For example: "control",
}

/**
 * The UseExperimentsResult type represents the result of the useExperiments hook.
 *
 * It contains the following properties:
 * - experiments: An object containing all the experiments in the system.
 * - production: An array of production blocks that are currently live.
 * - resetExperiments: A function to reset the experiments and production data.
 */
interface UseExperimentsResult {
    experiments: CollatedExperiment[];
    resetExperiments: () => void;
}

export function useExperiments(): UseExperimentsResult {
    const [experiments, setExperiments] = useState<CollatedExperiment[]>([]);

    // Load data on initial mount
    useEffect(() => {
        const loadExperiments = () => {
            // Import the experiments and production data from JSON files
            // Then cast them to the appropriate types since the
            const experimentsData = experimentsImport as unknown as CollatedExperiment[];

            setExperiments(experimentsData);
        };

        loadExperiments();
    }, []);

    // Reset experiments and production data
    const resetExperiments = () => {
        setExperiments(experimentsImport as unknown as CollatedExperiment[]);
    };

    return { experiments, resetExperiments };
}
