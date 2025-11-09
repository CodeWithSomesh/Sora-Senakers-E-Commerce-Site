import {
    //Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import * as Select from '@radix-ui/react-select';
import classnames from 'classnames';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { useState } from "react";
import { useGetProduct } from "@/api/ProductsApi";


type FilterTerm = string | undefined;

interface FilteringDropdownProps {
  filterTerm: FilterTerm;
  setFilterTerm: React.Dispatch<React.SetStateAction<FilterTerm>>;
}

const FilteringDropdown: React.FC<FilteringDropdownProps> = ({ filterTerm, setFilterTerm }) => {


    const handleSelect = (value: string) => {
        setFilterTerm(value);
        console.log("Selected filter term:", filterTerm);

    }
      

  return (
    <div className="w-full border  border-b-gray-400" >
        <Select.Root onValueChange={handleSelect} >
            <Select.Trigger
            className="inline-flex items-center font-bold italic  justify-center px-[50px] text-[24px] font-inter leading-none h-[65px] gap-[20px] 
            bg-white text-violet11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] 
            focus:shadow-black data-[placeholder]:text-violet9 outline-none border-r rounded-none border-gray-400" 
            aria-label="Food"
            >
            <Select.Value placeholder="Filter & Sort By" />
            <Select.Icon className="text-violet11 ml-4">
                <ChevronDownIcon width={25} height={25} />
            </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
            <Select.Content className="overflow-hidden bg-white rounded-md 
            shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
                <ChevronUpIcon />
                </Select.ScrollUpButton>
                <Select.Viewport className="p-[5px]">
                <Select.Group>
                    {/* <Select.Label className="px-[25px] text-xs leading-[25px] text-mauve11">
                        Fruits
                    </Select.Label> */}

                    <SelectItem value="newArrivals" className="text-[22px] font-inter font-medium " >New Arrivals</SelectItem>
                    <SelectItem value="bestSelling" className="text-[22px] font-inter font-medium ">Best Selling</SelectItem>
                    <SelectItem value="onSale" className="text-[22px] font-inter font-medium ">On Sale</SelectItem>
                    <SelectItem value="alphabetsAscending" className="text-[22px] font-inter font-medium ">Alphabetically, A - Z</SelectItem>
                    <SelectItem value="alphabetsDescending" className="text-[22px] font-inter font-medium ">Alphabetically, Z - A</SelectItem>
                    <SelectItem value="priceAscending" className="text-[22px] font-inter font-medium ">Price, Low To High</SelectItem>
                    <SelectItem value="PriceDescending" className="text-[22px] font-inter font-medium ">Price, High To Low</SelectItem>
                    <SelectItem value="dateAscending" className="text-[22px] font-inter font-medium ">Date, Old To New</SelectItem>
                    <SelectItem value="dateDescending" className="text-[22px] font-inter font-medium ">Date, New To Old</SelectItem>
                    <SelectItem value="all" className="text-[22px] font-inter font-medium ">Show All</SelectItem>
                </Select.Group>

                </Select.Viewport>
                <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
                <ChevronDownIcon />
                </Select.ScrollDownButton>
            </Select.Content>
            </Select.Portal>
        </Select.Root>

    </div>
  )
}

export default FilteringDropdown