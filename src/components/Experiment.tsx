import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

// Components
import {ExperimentOverrides} from './ExperimentOverrides';
import {Pill} from './Pill';

// Hooks
import { ProductionBlock, ExperimentBlock } from '../hooks/useExperiments';
import {useExperimentOverrides} from '../contexts/ExperimentOverridesProvider';

// Utility functions
import { prettifyName } from '../utils/prettifyName';
import { formatDate } from '../utils/formatDate';

interface ExperimentProps {
    experiment: ExperimentBlock;
    productionData?: ProductionBlock[];
    isLuckyLast?: boolean;
}

/**
 * This component is used to display an experiment and its overrides.
 * It uses the Disclosure component from Headless UI to manage the open/closed state of the experiment details.
 *
 * Additionally, it displays:
 * - the experiment name,
 * - the date it was found,
 * - a pill indicating if the experiment has been overridden.
 *
 * @param experiment experiment - The experiment to display
 * @param productionData productionData - The production data to display
 */
export function Experiment({ experiment, productionData, isLuckyLast }: ExperimentProps) {
    const { overrides } = useExperimentOverrides();
    const productionExperiment = productionData.find((p) => p.name === experiment.name);

    return (
        <Disclosure as="div" key={experiment.name}>
            {({ open }) => (
                <>
                    <DisclosureButton className="gap-5 text-left group grid grid-cols-4 w-full items-center justify-end">
                        <div className="col-span-3 w-full text-lg font-semibold text-white p-3 justify-self-start">
                            <div>
                                {prettifyName(experiment.name)}
                                {overrides[experiment.name] && (<Pill label="Overriden" className="justify-self-end" />)}
                            </div>
                            {productionExperiment && (
                                <div className="mt-1 text-xs text-gray-500">
                                    {formatDate(productionExperiment.dateFound)}
                                </div>
                            )}
                        </div>
                        <div className='justify-self-end mr-2'>
                            <ChevronDownIcon className={`size-5 fill-white/60 transition-transform duration-200 ease-in-out group-hover:fill-white/50 ${open ? 'rotate-180' : ''}`} />
                        </div>
                    </DisclosureButton>
                    <DisclosurePanel as='div' transition className={`overflow-hidden transition-all duration-500 ease-in-out ${open ? 'opacity-100' : 'max-h-0 opacity-0'}`}>
                        <ExperimentOverrides experiment={experiment} staffOverride={productionExperiment?.staffOverride} isLuckyLast={isLuckyLast} />
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    );
}
