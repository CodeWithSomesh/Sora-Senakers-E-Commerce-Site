import landingImage from "../assets/landing.png"
import appDownloadImage from "../assets/appDownload.png"
import EmailSection from "@/components/EmailSection";


const HomePage = () => {
    
    return(
        <div className="container mx-auto flex-1 py-10">
            {/*adding flex box, elements in the page to be in col, add gap of 12 between elements*/}
            <div className="flex flex-col gap-10 my-12">
                {/* Download App Section */}
                <div className="grid md:grid-cols-2 gap-2" >
                    <img src={landingImage} width={360}/>
                    {/*elements in 2nd col to be in a col, center & justify everything, gap btween elements*/}
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        {/* tracking-tighter: spacing for space between chars */}
                        <span className="font-bold font-inter text-3xl tracking-tighter italic">
                            Shop Anywhere, Anytime!
                        </span>
                        <span className="font-inter text-xl">
                            Enhance your shopping experience with our mobile app. 
                            <p>Available for download!</p>
                        </span>
                            <img src={appDownloadImage} />
                    </div>
                </div>

                
            </div>

        </div>
        

    )
}

export default HomePage;