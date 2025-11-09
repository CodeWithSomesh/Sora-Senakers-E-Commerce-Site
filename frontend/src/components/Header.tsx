import { Link, useLocation } from "react-router-dom";
import MobileNav from "./MobileNav";
import MainNav from "./MainNav";

const Header = () => {
    const location = useLocation();
   const path = location.pathname

    return(
        <div className="border-b-2 border-b-orange-500 py-6">

            <div className="container mx-auto flex justify-between items-center">
                <Link 
                    to="/" 
                    className="text-2xl font-bold tracking-tight font-inter "
                >
                    SoRa Sneakers
                </Link>
                <div className="flex gap-20 text-md font-medium font-inter mr-16">
                    <Link to="/menProducts" className={`hover:text-violet font-semibold ${path === "/menProducts" ? "font-bold text-violet2 text-lg italic" : ""}`}>
                        Men
                        {path === "/menProducts" ? (
                            <div className="border border-black"></div>
                        ): ""}
                    </Link>
                    
                    <Link to="/womenProducts" className={`hover:text-violet font-semibold ${path === "/womenProducts" ? "font-bold text-violet2 text-lg italic" : ""}`}>
                        Women 
                        {path === "/womenProducts" ? (
                            <div className="border border-black"></div>
                        ): ""}  
                    </Link>
                    <Link to="/kidsProducts" className={`hover:text-violet font-semibold ${path === "/kidsProducts" ? "font-bold text-violet2 text-lg italic" : ""}`}>
                        Kids
                        {path === "/kidsProducts" ? (
                            <div className="border border-black"></div>
                        ): ""}
                    </Link>
                </div>
                <div className="md:hidden">
                    <MobileNav/>
                </div>
                <div className="hidden md:block">
                    <MainNav/>
                </div>
            </div>

        </div>

    );
        
    
};

export default Header;