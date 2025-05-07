import {ExperimentBlock, ProductionBlock} from '../hooks/useExperiments';
import {SortByType} from '../contexts/SortBarProvider';

/**
 * Sort experiments based on the given sort option.
 * @param {ExperimentBlock[]} experiments - The list of experiments.
 * @param {ProductionBlock[]} production - The production data.
 * @param {string} sortBy - The sorting criteria.
 * @returns {ExperimentBlock[]} - The sorted experiments.
 */
export function sortExperiments(experiments: ExperimentBlock[], production: ProductionBlock[], sortBy: SortByType) : ExperimentBlock[] {
    switch (sortBy) {
        case 'name':
            return [...experiments].sort((a, b) => a.name.localeCompare(b.name));
        case 'discovery-oldest':
            return [...experiments].sort((a, b) => {
                const aProd = production.find((p) => p.name === a.name);
                const bProd = production.find((p) => p.name === b.name);
                if (aProd && bProd) {
                    return new Date(aProd.dateFound).getTime() - new Date(bProd.dateFound).getTime();
                }
                return aProd ? -1 : 1;
            });
        case 'discovery-newest':
            return [...experiments].sort((a, b) => {
                const aProd = production.find((p) => p.name === a.name);
                const bProd = production.find((p) => p.name === b.name);
                if (aProd && bProd) {
                    return new Date(bProd.dateFound).getTime() - new Date(aProd.dateFound).getTime();
                }
                return aProd ? -1 : 1;
            });
        default:
            return experiments;
    }
}
