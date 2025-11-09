import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

const DetailsSection = () => {
    const { control } = useFormContext();
    return (
        <div className="space-y-2">
            <div>
                <h2 className="text-2xl font-bold">Details</h2>
                <FormDescription>
                    Enter details about item
                </FormDescription>
            </div>
            <FormField 
                control={control} 
                name="shopName" 
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
            <div className="flex gap-4">
                <FormField 
                    control={control} 
                    name="color" 
                    render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                <FormField 
                    control={control} 
                    name="price" 
                    render={({ field }) => (
                        <FormItem className="max-w-[25%]">
                            <FormLabel>Price  (Rm)</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white" placeholder="89.90" />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

export default DetailsSection;