import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    email: z.string().optional(),
    name: z.string().min(1, "name is required"),
    addressLine1: z.string().min(1, "Address Line 1 is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
})

/* using the zod framework to automatically determine the type based on the formSchema*/
export type UserFormData = z.infer<typeof formSchema>;

type Props = {
    currentUser: User;
    /* allowing us to do API stuff at the page level */
    onSave: (userProfileData: UserFormData) => void;
    isLoading: boolean;
};

const UserProfileForm = ({ onSave, isLoading, currentUser }: Props) => {
    /* imported the useForm from react-hook-form, 
    we telling that the type of our form is "UserFormData" which has all the fields */
    const form = useForm<UserFormData>({
        /* handles validation of formSchema*/
        resolver: zodResolver(formSchema),
        defaultValues: currentUser,
    });

    useEffect(() =>{
        form.reset(currentUser);
    }, [currentUser, form]);

    return(
        /*passing all the stuff in form var into the shadcn form */
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(onSave)}
                className="space-y-4 bg-gray-50 rounded-lg px-20 py-6 font-inter"
            >
                <div>
                    <h2 className="text-3xl font-bold text">User Profile Form</h2>
                    <FormDescription className="text-md">
                        View and change your profile information here
                    </FormDescription>
                </div>
                
                {/*EMAIL FORM */}
                <FormField 
                    control={form.control} 
                    name="email" 
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} disabled className="bg-white"/>
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/*NAME FORM */}
                <FormField 
                    control={form.control} 
                    name="name" 
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} className="bg-white"/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                {/*ADDRESS FORM */}
                <div className="flex flex-col md:flex-row gap-4">
                    <FormField 
                        control={form.control} 
                        name="addressLine1" 
                        render={({field}) => (
                            <FormItem className="flex-1">
                                <FormLabel>Address Line 1</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/*CITY FORM */}
                    <FormField 
                        control={form.control} 
                        name="city" 
                        render={({field}) => (
                            <FormItem className="flex-1">
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/*COUNTRY FORM */}
                    <FormField 
                        control={form.control} 
                        name="country" 
                        render={({field}) => (
                            <FormItem className="flex-1">
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {isLoading ? (
                    <LoadingButton/> 
                ) : (
                    <Button type="submit" className="bg-violet2">
                        Submit
                    </Button>
                )} 
            </form>
                
        </Form>
    );
};

export default UserProfileForm;

