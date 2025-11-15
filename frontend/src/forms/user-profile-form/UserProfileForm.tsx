import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
    email: z.string().optional(),
    name: z.string().min(1, "name is required"),
    addressLine1: z.string().min(1, "Address Line 1 is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    mfaEnabled: z.boolean().optional(),
})

/* using the zod framework to automatically determine the type based on the formSchema*/
export type UserFormData = z.infer<typeof formSchema>;

type Props = {
    currentUser: User;
    /* allowing us to do API stuff at the page level */
    onSave: (userProfileData: UserFormData) => void;
    isLoading: boolean;
};

const UserProfileForm = ({ onSave, isLoading, currentUser}: Props) => {
    console.log(currentUser)
    /* imported the useForm from react-hook-form, 
    we telling that the type of our form is "UserFormData" which has all the fields */
    const [mfaLoading, setMfaLoading] = useState(false);
    const [mfaError, setMfaError] = useState("");
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);

    const form = useForm<UserFormData>({
        /* handles validation of formSchema*/
        resolver: zodResolver(formSchema),
        defaultValues: currentUser,
    });

    const isDirty = form.formState.isDirty;

    const location = useLocation();
    const navigate = useNavigate();
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveAction, setLeaveAction] = useState<'navigate' | 'close' | null>(null);
    const [nextLocation, setNextLocation] = useState<string | null>(null);

    // Handle page close/refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = ''; // This still shows browser's default dialog
                // Note: Custom modals can't intercept browser close/refresh, 
                // browsers only allow their default confirmation dialog
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Block navigation if form is dirty
    useEffect(() =>{
        const handlePopState = (e: PopStateEvent) => {
            if (isDirty) {
                e.preventDefault();
                window.history.pushState(null, '', location.pathname);
                setLeaveAction('navigate');
                setShowLeaveModal(true);
            }
        };

        if (isDirty) {
            window.history.pushState(null, '', location.pathname);
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isDirty, location]);

    // Intercept link clicks
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (isDirty) {
                const target = e.target as HTMLElement;
                const link = target.closest('a');

                if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
                    const url = new URL(link.href);
                    if (url.origin === window.location.origin && url.pathname !== location.pathname) {
                        e.preventDefault();
                        setNextLocation(url.pathname);
                        setLeaveAction('navigate');
                        setShowLeaveModal(true);
                    }
                }
            }
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, [isDirty, location]);

    const handleLeaveConfirm = () => {
        if (leaveAction === 'navigate' && nextLocation) {
            navigate(nextLocation);
        } else if (leaveAction === 'navigate') {
            window.history.back();
        }
        setShowLeaveModal(false);
        setNextLocation(null);
        setLeaveAction(null);
    };

    const handleLeaveCancel = () => {
        setShowLeaveModal(false);
        setNextLocation(null);
        setLeaveAction(null);
    };

    const handleMfaToggle = async (checked: boolean, onSuccess: (enabled: boolean) => void) => {
        if (!currentUser.auth0Id) {
            setMfaError("User ID is required for MFA");
            return;
        }

        setMfaLoading(true);
        setMfaError("");

        try {
            const endpoint = checked ? "/api/mfa/enable" : "/api/mfa/disable";

            const response = await fetch(`http://localhost:7000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUser.auth0Id })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                onSuccess(checked);
                if (checked) {
                    setShowSuccessNotification(true);
                    setTimeout(() => setShowSuccessNotification(false), 3000);
                }
            } else {
                setMfaError(data.error || `Failed to ${checked ? 'enable' : 'disable'} MFA`);
                onSuccess(!checked);
            }
        } catch (err) {
            console.error("MFA toggle error:", err);
            setMfaError("Network error occurred");
            onSuccess(!checked);
        } finally {
            setMfaLoading(false);
        }
    };

    useEffect(() => {
        form.reset(currentUser);


    }, [currentUser, form]);


    return(
        /*passing all the stuff in form var into the shadcn form */
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSave)}
                className="space-y-14 bg-gray-50 rounded-lg px-20 pt-10 pb-30 "
            >
                <div>
                    <h2 className="text-3xl font-bold text">User Profile Form</h2>
                    <FormDescription className="text-md mt-1">
                        View and change your profile information here
                    </FormDescription>
                </div>
                
                {showSuccessNotification && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
                        <p className="font-medium">MFA enabled successfully!</p>
                        <p className="text-sm">You'll be prompted to set up authentication on your next login.</p>
                    </div>
                )}

                <div className="flex gap-6">
                    {/*EMAIL FORM */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormLabel className="text-xl">Email</FormLabel>
                                <FormControl>
                                    <Input {...field} disabled className="bg-white h-[40px] focus-visible:ring-offset-0 placeholder:text-grey-500 px-4 text-[16px] border-gray-300 focus-visible:ring-transparent"/>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/*NAME FORM */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormLabel className="text-xl">Name</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white h-[40px] focus-visible:ring-offset-0 placeholder:text-grey-500 px-4 text-[16px] border-gray-300 focus-visible:ring-transparent"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>

                {/*ADDRESS FORM */}
                <div className="flex flex-col md:flex-row gap-4">
                    <FormField
                        control={form.control}
                        name="addressLine1"
                        render={({field}) => (
                            <FormItem className="flex-1">
                                <FormLabel className="text-xl">Address Line 1</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white h-[40px] focus-visible:ring-offset-0 placeholder:text-grey-500 px-4 text-[16px] border-gray-300 focus-visible:ring-transparent"/>
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
                                <FormLabel className="text-xl">City</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white h-[40px] focus-visible:ring-offset-0 placeholder:text-grey-500 px-4 text-[16px] border-gray-300 focus-visible:ring-transparent"/>
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
                                <FormLabel className="text-xl">Country</FormLabel>
                                <FormControl>
                                    <Input {...field} className="bg-white h-[40px] focus-visible:ring-offset-0 placeholder:text-grey-500 px-4 text-[16px] border-gray-300 focus-visible:ring-transparent"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="mfaEnabled"
                    render={({ field }) => (
                        <div className="space-y-2">
                            <div className="flex flex-row items-center justify-between rounded-lg border border-gray-300 bg-white p-6">
                                <div className="space-y-0.5">
                                    <label className="text-xl font-medium">Two-Factor Authentication</label>
                                    <p className="text-sm text-gray-500">
                                        Enable Auth0 MFA for enhanced account security
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={field.value || false}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        field.onChange(checked);
                                        handleMfaToggle(checked, (enabled) => {
                                            field.onChange(enabled);
                                        });
                                    }}
                                    disabled={mfaLoading || isLoading}
                                    className="w-6 h-6 cursor-pointer accent-violet2 disabled:opacity-50"
                                />
                            </div>
                            {mfaError && (
                                <p className="text-red-500 text-sm px-2">{mfaError}</p>
                            )}
                        </div>
                    )}
                />

                {
                    isLoading ? (
                        <LoadingButton />
                    ) : (
                        <Button type="submit" className="bg-violet2 text-2xl p-7 hover:bg-black hover:text-violet2 font-bold w-full font-inter">
                            Submit
                        </Button>
                    )
                }

                <div className="h-10"></div>
            </form>
            {/* Leave Confirmation Modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold mb-4">⚠️ Unsaved Changes</h3>
                        <p className="text-gray-600 mb-6">
                            You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={handleLeaveCancel}
                                variant="outline"
                                className="flex-1"
                            >
                                Stay on Page
                            </Button>
                            <Button
                                type="button"
                                onClick={handleLeaveConfirm}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                            >
                                Leave Anyway
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </Form>
    );
};

export default UserProfileForm;

