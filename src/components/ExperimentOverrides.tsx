import {useMemo, useState} from 'react';
import {Radio, RadioGroup} from '@headlessui/react';
import {ExperimentIcon} from './ExperimentIcon';
import {Pill} from './Pill';
import {ExperimentBlock} from '../hooks/useExperiments';
import {useExperimentOverrides} from '../contexts/ExperimentOverridesProvider';

type ExperimentOverridesProps = {
    experiment: ExperimentBlock,
    staffOverride?: string,
    isLuckyLast?: boolean,
}

export function ExperimentOverrides({experiment, staffOverride, isLuckyLast}: ExperimentOverridesProps) {
    // Retrieve the current override from the context
    const {overrides, setOverride, removeOverride} = useExperimentOverrides();
    const [selected, setSelected] = useState(() => {
        // Default should be the group with the largest weight. But we want to preserve the order of the experiments
        // within the experiment object. So we need to clone the groups and sort them by weight.
        // This will be used to determine the default selected group
        const sortedGroups = [...experiment.groups].sort((a, b) => b.weight - a.weight);
        const defaultGroup = sortedGroups[0].value;

        // Check if the experiment has an override in the context
        const override = overrides[experiment.name];
        if (override) {
            return experiment.groups.find((group) => group.value === override)?.value || defaultGroup;
        }
        // If no override is found, return default group
        return defaultGroup;
    });
    const largestGroup = useMemo(() => {
        // Find the group with the largest weight by sorting the groups
        const sortedGroups = [...experiment.groups].sort((a, b) => b.weight - a.weight);
        return sortedGroups[0].value;
    }, [experiment.groups]);

    return (
        <RadioGroup
            key={experiment.name}
            value={selected}
            onChange={(override) => {
                setSelected(override);

                // If the selected group is the largest group, remove the override
                // We don't care since it's not an override
                if (override === largestGroup) {
                    removeOverride(experiment.name);
                    return;
                }

                setOverride(experiment.name, override);
            }}
            defaultValue={selected}
            className="space-y-0"
            aria-label={`Select an experiment group for ${experiment.name}`}
        >
            {experiment.groups.map((group, index) => (
                <>
                    <Radio
                        as='div'
                        key={group.value}
                        value={group.value}
                        className={`group relative flex flex-grow cursor-pointer text-white transition py-3 px-10 border-2 border-transparent hover:bg-white/10 focus:bg-white/10 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/5'} ${isLuckyLast && index === experiment.groups.length - 1 ? 'rounded-b-md' : ''}`}
                    >
                        <div className="flex gap-4 w-full overflow-clip items-center">
                            <ExperimentIcon
                                isChecked={selected === group.value}
                                className="justify-self-start"
                            />

                            <div className="text-sm w-full">
                                <div className="font-semibold text-white">
                                    <span>{group.value}</span>
                                    {staffOverride && staffOverride === group.value && <Pill label="Staff Default" className="justify-self-end" />}
                                    {largestGroup === group.value && <Pill label="Default" className="justify-self-end" />}
                                </div>
                                <div className="text-white/50">{group.weight}</div>
                            </div>
                        </div>
                    </Radio>
                    {index < experiment.groups.length - 1 && <hr className='border-white/15' />}
                </>
            ))}
        </RadioGroup>
    )
}
