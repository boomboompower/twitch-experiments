import { useEffect, useState } from 'react';
import experimentsImport from '../data/experiments.json';
import productionImport from '../data/production.json';

/**
 * The ExperimentHolder type represents a collection of experiments in the system.
 */
export type ExperimentHolder = {
    [name: string]: ExperimentBlock;
};

/**
 * The ExperimentBlock type represents a single experiment in the system.
 *
 * It contains the following properties:
 * - name: The name of the experiment.
 * - v: The version of the experiment.
 * - t: The type of the experiment.
 * - groups: An array of groups associated with the experiment, each containing:
 *   - weight: The weight of the group, which determines its probability of being selected.
 *   - value: The value of the group, which represents the specific variant of the experiment.
 *
 *   Types are defined as follows:
 *   - experiment t = 1 is an experiment on a device ID     [Device]
 *   - experiment t = 2 is an experiment on a user ID       [User]
 *   - experiment t = 3 is an experiment on a channel       [Channel]
 *   Other types are currently undocumented and may be used for future experiments.
 */
export type ExperimentBlock = {
    name: string;
    v: number;
    t: number;
    groups: {
        weight: number;
        value: string;
    }[];
};

/**
 * The ProductionBlock type represents a single production block in the system. ie. a live experiment
 * on the production environment. This is used to determine which experiments are currently being served to users.
 *
 * It contains the following properties:
 * - id: The unique identifier of the production block.
 * - name: The name of the production block.
 * - dateFound: The date when the production block was found.
 * - staffOverride: An optional field that indicates if there is a staff override for the production block.
 */
export type ProductionBlock = {
    id: string;
    name: string;
    dateFound: string;
    staffOverride?: string;
};

/**
 * The UseExperimentsResult type represents the result of the useExperiments hook.
 *
 * It contains the following properties:
 * - experiments: An object containing all the experiments in the system.
 * - production: An array of production blocks that are currently live.
 * - resetExperiments: A function to reset the experiments and production data.
 */
interface UseExperimentsResult {
    experiments: ExperimentHolder;
    production: ProductionBlock[];
    resetExperiments: () => void;
}

/**
 * isServingOneGroup checks if an experiment is currently being served to one group. These experiments
 * are serving a single group to all users, which means they are not being tested against other groups.
 *
 * Therefore, they can technically be removed, and are not considered active experiments.
 * @param exp The experiment to check.
 */
export function isServingOneGroup(exp: ExperimentBlock) : boolean {
    const groupsAt0 = exp.groups.filter((group) => {
        return group.weight === 0;
    });

    return groupsAt0.length >= exp.groups.length - 1;
}

export function useExperiments(): UseExperimentsResult {
    const [experiments, setExperiments] = useState<ExperimentHolder>({});
    const [production, setProduction] = useState<ProductionBlock[]>([]);

    // Load data on initial mount
    useEffect(() => {
        const loadExperiments = () => {
            // Import the experiments and production data from JSON files
            // Then cast them to the appropriate types since the
            const experimentsData = experimentsImport as unknown as ExperimentHolder;
            const productionData = productionImport as unknown as ProductionBlock[];

            setExperiments(experimentsData);
            setProduction(productionData);
        };

        loadExperiments();
    }, []);

    // Reset experiments and production data
    const resetExperiments = () => {
        setExperiments(experimentsImport as unknown as ExperimentHolder);
        setProduction(productionImport as unknown as ProductionBlock[]);
    };

    return { experiments, production, resetExperiments };
}
