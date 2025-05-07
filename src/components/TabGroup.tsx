import { useState, useMemo } from 'react';
import { TabGroup as HeadlessTabGroup, TabList, TabPanels, TabPanel, Tab } from '@headlessui/react';
import { Experiment } from './Experiment';
import { SortBar } from './SortBar';
import { ExperimentPercentage } from './ExperimentPercentage';
import { useSortBar } from '../contexts/SortBarProvider';
import { useTabExperiments } from '../hooks/useTabExperiments';
import { useExperiments } from '../hooks/useExperiments';
import { sortExperiments } from '../utils/sortExperiments';

/**
 * TabGroup component is used to display a tabbed interface for managing experiments.
 * It uses the Headless UI TabGroup component to create a tabbed interface.
 *
 * As for rendering, it shows a tablist with three tabs:
 * - Active: Shows all active experiments
 * - Serving One: Shows all experiments that are currently being served to one user
 * - Unregistered: Shows all experiments that are not registered in the production.json and are not being served to any user
 *
 * It then displays the experiments in the selected tab.
 *
 * @constructor
 */
export function TabGroup() {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const { experiments, production } = useExperiments();
    const { sortBy } = useSortBar();

    const { activeExperiments, servingOneExperiments, unregisteredExperiments } = useTabExperiments(experiments, production);

    const tabExperiments = useMemo(() => {
        // Active is only experiments inside the production.json
        // Serving One is experiments that are currently being served to one user
        // Unregistered is experiments that are not registered in the production.json and are not being served to any user

        // We need to filter the experiments based on the selected tab
        switch (selectedIndex) {
            case 0: return activeExperiments;
            case 1: return servingOneExperiments;
            case 2: return unregisteredExperiments;
            default: return [];
        }
    }, [selectedIndex, activeExperiments, servingOneExperiments, unregisteredExperiments]);

    const sortedTabExperiments = useMemo(() => sortExperiments(tabExperiments, production, sortBy), [tabExperiments, sortBy, production]);

    // Calculate the total number of experiments
    const unusedCount = servingOneExperiments.length + unregisteredExperiments.length;
    const totalExperiments = activeExperiments.length + servingOneExperiments.length + unregisteredExperiments.length;

    const tabData = [
        { name: 'Active', count: activeExperiments.length },
        { name: 'Serving One', count: servingOneExperiments.length },
        { name: 'Unregistered', count: unregisteredExperiments.length },
    ];

    return (
        <HeadlessTabGroup selectedIndex={selectedIndex} onChange={(index) => {
            setSelectedIndex(index);
        }}>
            <SortBar />

            <ExperimentPercentage unusedCount={unusedCount} totalCount={totalExperiments} />

            <TabList className="lg:flex gap-4 grid grid-cols-3">
                {tabData.map(({name, count}, index) => (
                    <Tab
                        key={name}
                        // onClick={(e) => { setSelectedIndex(name); e.preventDefault(); }}
                        className={`rounded-full px-3 py-1 text-sm font-semibold text-white ${selectedIndex === index ? 'bg-white/15' : 'bg-white/5'}`}
                    >
                        {name}<span className='text-xs'> ({count}/{totalExperiments})</span>
                    </Tab>
                ))}
            </TabList>
            <TabPanels>
                <TabPanel static>
                    <div className="mt-3 mb-5 gap-4 mx-auto w-full divide-y divide-white/5 rounded-md bg-white/5">
                        {sortedTabExperiments.map((exp, index) => (
                            <Experiment key={exp.name} experiment={exp} productionData={production} isLuckyLast={index === sortedTabExperiments.length - 1} />
                        ))}
                    </div>
                </TabPanel>
            </TabPanels>
        </HeadlessTabGroup>
    );
}
