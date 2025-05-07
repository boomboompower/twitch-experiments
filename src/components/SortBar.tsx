import {Field, Label, Select} from '@headlessui/react';
import {SortByType, useSortBar} from '../contexts/SortBarProvider';

export function SortBar() {
    const { setSortBy } = useSortBar();

    return (
        <Field className="flex items-center gap-2 mb-2 mt-2 w-full lg:w-auto lg:mb-0 lg:mt-0">
            <Label htmlFor="sort" className="block w-full text-sm/6 font-semibold text-gray-200">Sort by:</Label>
            <Select
                onChange={(e) => setSortBy(e.target.value as SortByType)}
                className="w-full lg:w-auto bg-gray-800 text-gray-200 border border-gray-700 rounded-md p-1">
                <option value="name">Name</option>
                <option value="discovery-newest">Newest to Oldest</option>
                <option value="discovery-oldest">Oldest to Newest</option>
            </Select>
        </Field>
    )
}
