import { Button } from "@/components/ui/button";
import { FormDescription, FormField, FormItem } from "@/components/ui/form";
import { useFieldArray, useFormContext } from "react-hook-form"
import SizeStockInput from "./SizeStockInput";


const SizeSection = () => {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "sizeStock",
    });

    return (
        <div className="space-y-2">
            <div>
                <h2 className="text-2xl font-bold">Size</h2>
                <FormDescription>
                    Create available size and update the stock
                </FormDescription>
            </div>
                <FormField 
                control={control} 
                name="sizeStock" 
                render={() => (
                    <FormItem className="flex flex-col gap-2">
                        {fields.map((_, index) => (
                            <SizeStockInput 
                                index={index}
                                removeSizeStock={() => remove(index)}/>
                        ))}
                    </FormItem>
                )}
                />
                {/* when button is pressed, it will add blank fields at the bottom, user will be able to populate as they wish*/}
                <Button type="button" onClick={() => append({ size: "", stock: ""})}>
                    Add Sizes
                </Button>
        </div>
            
    )
};

export default SizeSection;