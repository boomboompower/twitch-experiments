import { useMemo } from 'react';
import {ExperimentBlock, ExperimentHolder, isServingOneGroup, ProductionBlock} from './useExperiments';

type TabExperiments = {
    activeExperiments: ExperimentBlock[];
    servingOneExperiments: ExperimentBlock[];
    unregisteredExperiments: ExperimentBlock[];
}

/**
 * Hook to categorize experiments by their tab groups: Active, Serving One, Unregistered
 * @param {Array} experiments - The list of experiments.
 * @param {Array} production - The production data.
 * @returns {Object} - Contains categorized experiments.
 */
export function useTabExperiments(experiments: ExperimentHolder, production: ProductionBlock[]) : TabExperiments  {
    return useMemo(() => {
        const active = [];
        const servingOne = [];
        const unregistered = [];

        // Iterate over the experiments and sort them into the three categories
        for (const exp of Object.values(experiments)) {
            const isInProduction = production.some((p) => p.name === exp.name);

            if (isInProduction) {
                if (isServingOneGroup(exp)) {
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
    }, [experiments, production]);
}
