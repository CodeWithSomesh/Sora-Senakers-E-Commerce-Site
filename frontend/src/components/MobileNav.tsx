import { CircleUserRound, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import MobileNavLinks from "./MobileNavLinks";
import { useAuth0 } from "@auth0/auth0-react";

const MobileNav = () => {
    const { isAuthenticated, loginWithRedirect, user } = useAuth0();
    return(
        <Sheet>
            <SheetTrigger>
                <Menu className="text-orange-500"/>
            </SheetTrigger>
            <SheetContent className="space-y-3">
                <SheetTitle>
                    {isAuthenticated ? (    
                        <span className="flex items-center font-bold gap-2">
                            <CircleUserRound className="text-orange-500"/>
                            {/* it will display user's email, if logged in */}
                            {user?.email}
                        </span> 
                    )  : (
                        <span> Welcome to SoRa Sneakers</span>
                    )}
                </SheetTitle>
                <Separator/>
                <SheetDescription className="flex flex-col gap-4">
                    {isAuthenticated ? (
                        <MobileNavLinks/>
                    ) : (
                        <Button onClick={() => loginWithRedirect()} className="flex-1 font-bold font-inter hover:text-violet3 bg-violet2 text-white py-5 hover:bg-black" >Log In</Button>
                    ) }
                    
                </SheetDescription>
            </SheetContent>
        </Sheet>
    );
};

export default MobileNav;