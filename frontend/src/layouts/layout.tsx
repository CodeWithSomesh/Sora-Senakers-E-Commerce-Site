import AsSeenOnSection from "@/components/AsSeenOnSection";
import BannerCategory from "@/components/BannerCategory";
import EmailSection from "@/components/EmailSection";
import FAQ from "@/components/FAQ";
import FilteringDropdown from "@/components/FilteringDropdown";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NavbarPromoMessage from "@/components/NavbarPromoMessage";
import NewArrivals from "@/components/NewArrivals";
import { EmblaOptionsType } from 'embla-carousel'
import { useLocation } from "react-router-dom";

//Declaring Typescript types for variables
type Props = {
    children: React.ReactNode; 
    homePage?: boolean;
    adminPage?: boolean;
}

const OPTIONS: EmblaOptionsType = { loop: true }
const SLIDE_COUNT = 8
const SLIDES = Array.from(Array(SLIDE_COUNT).keys())

const Layout = ({children, homePage = false, adminPage = false,}: Props) => {
    const location = useLocation();
    const path = location.pathname

    return (
        <div className="flex flex-col min-h-screen">
            
            {/* Customer View */}
            {!adminPage ? 
                <div className="flex-1 flex flex-col">
                    <Header />
                    <NavbarPromoMessage />
                    {/* If homePage == true, display Hero section*/}
                    {homePage &&  <Hero />} 
                    {homePage &&  <NewArrivals slides={SLIDES} options={OPTIONS} />} 
                    {homePage &&  <BannerCategory />} 
                    {/* {homePage &&  <AsSeenOnSection />}  */}

                    <div className="flex-1">{children}</div>
                    {homePage &&  <FAQ />} 
                    {homePage &&  <EmailSection />} 
                    <Footer />
                </div>
                

            :   
                // Admin View
                <div>
                    <div className="flex-1">{children}</div>
                </div>
            }
        </div>
   )         
}

export default Layout
