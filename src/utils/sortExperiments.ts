import {CollatedExperiment} from '../hooks/useExperiments';
import {SortByType} from '../contexts/SortBarProvider';

/**
 * Sort experiments based on the given sort option.
 * @param {CollatedExperiment[]} experiments - The list of experiments.
 * @param {string} sortBy - The sorting criteria.
 * @returns {CollatedExperiment[]} - The sorted experiments.
 */
export function sortExperiments(experiments: CollatedExperiment[], sortBy: SortByType) : CollatedExperiment[] {
    switch (sortBy) {
        case 'name':
            return [...experiments].sort((a, b) => a.name.localeCompare(b.name));
        case 'discovery-oldest':
            return [...experiments].sort((a, b) => {
                if (a && b) {
                    return new Date(a.dateFound).getTime() - new Date(b.dateFound).getTime();
                }
                return a ? -1 : 1;
            });
        case 'discovery-newest':
            return [...experiments].sort((a, b) => {
                if (a && b) {
                    return new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime();
                }
                return a ? -1 : 1;
            });
        default:
            return experiments;
    }
}
