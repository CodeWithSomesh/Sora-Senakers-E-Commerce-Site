const Footer = () => {

    return (
        <div className="bg-black py-10">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
                <span className="text-2xl font-bold tracking-tight font-inter text-white">
                    SoRa Sneakers
                </span>
                <span className="text-white font-bold tracking-tight flex gap-4 font-inter">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </span>
            </div>
        </div>
    )
}

export default Footer;