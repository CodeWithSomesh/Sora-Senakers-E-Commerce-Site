import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "./ui/button";
import UsernameMenu from "./UsernameMenu";

const MainNav = () => {
    const {loginWithRedirect, isAuthenticated} = useAuth0();

    return(
        <span className="flex space-x-2 items-center">
            {isAuthenticated ? (
                <UsernameMenu/>  
            ) : (
            <Button
                variant="ghost"
                className="font-bold font-inter hover:text-violet3 bg-violet2 text-white py-5 hover:bg-black"
                onClick={async () => await loginWithRedirect()}
            >
            Login
            </Button>
        )}
        </span>
    );
}

export default MainNav;