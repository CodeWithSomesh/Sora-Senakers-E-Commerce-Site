import { categoryList } from "@/config/shop-options-config";
import { Label } from "./ui/label";
import { ChangeEvent } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
    onChange: (category: string[]) => void;
    selectedCategory: string[];
    isExpanded: boolean;
    onExpandedClick: () => void;
};

const CategoryFilter = ({
    onChange,
    selectedCategory,
    isExpanded,
    onExpandedClick,
}: Props) => {

    const handleCategoryChange = (event: ChangeEvent<HTMLInputElement>) => {
        const clickedCategory = event.target.value;
        const isChecked = event.target.checked;

        const newCategoryList = isChecked 
            ? [...selectedCategory, clickedCategory] 
            : selectedCategory.filter((category) => category !== clickedCategory );

        onChange(newCategoryList);
    };

    const handleCategoryReset = () => onChange([]);

    return (
        <>
            <div className="flex justify-between items-center px-2">
                <div className="text-md font-semibold mb-2">Filter By Category</div>
                <div onClick={handleCategoryReset} className="text-sm font-semibold mb-2 underline cursor-pointer text-blue-500">
                    Reset Filters
                </div>
            </div>

            <div className="space-y-2 flex flex-col">
                {categoryList
                .slice(0, isExpanded ? categoryList.length : 7)
                .map((category) => {
                    const isSelected = selectedCategory.includes(category);
                    return (
                    <div className="flex">
                        <input id={`category_${category}`} 
                        type="checkbox"
                        className="hidden"
                        value={category}
                        checked={isSelected}
                        onChange={handleCategoryChange}
                    />
                    <Label htmlFor={`category_${category}`} className={`flex flex-1 items-center cursor-pointer text-sm rounded-full px-4 py-2 font-semibold ${
                        isSelected 
                            ? "border border-green-600 text-green-600" 
                            : "border border-slate-300" 

                        }`}
                    >
                        {isSelected && <Check size={20} strokeWidth={3} />}
                        {category}
                    </Label>
                    </div>)

                })}

                <Button 
                onClick={onExpandedClick}
                variant="link"
                className="mt-4 flex-1"
                >
                    {isExpanded ? (
                        <span className="flex flex-row items-center">
                            View Less <ChevronUp/>
                        </span>
                    ) : (
                        <span className="flex flex-row items-center">
                            View More <ChevronDown/>
                        </span>
                    )}

                </Button>
            </div>
        </>
    )
};

export default CategoryFilter;