import { useMemo } from 'react';
import {CollatedExperiment} from './useExperiments';

type TabExperiments = {
    activeExperiments: CollatedExperiment[];
    servingOneExperiments: CollatedExperiment[];
    unregisteredExperiments: CollatedExperiment[];
}

/**
 * Hook to categorize experiments by their tab groups: Active, Serving One, Unregistered
 * @param {CollatedExperiment[]} experiments - The list of experiments.
 * @returns {TabExperiments} - Contains categorized experiments.
 */
export function useTabExperiments(experiments: CollatedExperiment[]) : TabExperiments  {
    return useMemo(() => {
        const active: CollatedExperiment[] = [];
        const servingOne: CollatedExperiment[] = [];
        const unregistered: CollatedExperiment[] = [];

        // Iterate over the experiments and sort them into the three categories
        for (const exp of experiments) {
            const isInProduction = exp.active;

            if (isInProduction) {
                if (exp.servingOne) {
                    servingOne.push(exp);
                } else {
                    active.push(exp);
                }
            } else {
                unregistered.push(exp);
            }
        }

        return {
            activeExperiments: active,
            servingOneExperiments: servingOne,
            unregisteredExperiments: unregistered,
        };
    }, [experiments]);
}
