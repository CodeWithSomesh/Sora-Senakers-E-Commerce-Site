// ImageSection
// Encrypted image
import { FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { useFormContext } from "react-hook-form"


const ImageSection = () => {
    const { control, watch} = useFormContext();

    const existingImageUrl = watch("imageUrl");

    return (
        <div className="space-y-2">
            <div>
                <h2 className="text-2xl font-bold"></h2>
                <FormDescription>
                    Add an image that will be displayed on your shop listing. 
                    Adding a new image will overwrite the existing image.
                </FormDescription>
            </div>

            <div className="flex flex-col gap-8 md:w-[50%]">
                {existingImageUrl && (
                    //wide screen image that has 16 by 9
                    //adding preview image
                    <AspectRatio ratio={16/9}>
                        <img src={existingImageUrl} className="rounded-md object-cover h-full w-full"/>
                    </AspectRatio>
                )
            }
                <FormField 
                control={control} 
                name="imageFile" 
                render={({field}) => <FormItem>
                    <FormControl>
                        <Input 
                            className="bg-white" 
                            type="file" 
                            accept=".jpg, .jpeg, .png"
                            onChange={(event) => 
                                field.onChange(
                                    //if users put more than 1 picture, it will selct only the 1st one
                                    event.target.files ? event.target.files[0]: null
                                )
                            }
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>} 
                />

            </div>
        </div>
    )
}

export default ImageSection;