import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

type Props = {
    index: number;
    removeSizeItem: () => void;

};

const SizeItemInput = ({ index, removeSizeItem }: Props) => {
    const { control } = useFormContext();

    return (
        <div className="flex flex-row items-end gap-2">
            <FormField 
                control={control} 
                name={`sizeItems.${index}.name`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex items-center gap-1">
                            Size <FormMessage/>
                        </FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="37" className="bg-white"/>
                        </FormControl>
                    </FormItem>)}
                    
            />
            <FormField 
                control={control} 
                name={`sizeItems.${index}.stock`}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex items-center gap-1">
                            Stock <FormMessage/>
                        </FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="80" className="bg-white"/>
                        </FormControl>
                    </FormItem>
                )}     
            />
            <Button type="button" onClick={removeSizeItem} className="bg-red-500 max-h-fit">
                Remove
            </Button>
        </div>
    );
};

export default SizeItemInput;