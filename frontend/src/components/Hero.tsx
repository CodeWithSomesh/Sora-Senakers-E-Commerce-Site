import hero from "../assets/hero.png";
import banner1 from "../assets/banner1.webp";
import banner2 from "../assets/banner2.webp";
import banner3 from "../assets/banner3.webp";
import banner4 from "../assets/banner4.webp";
import banner5 from "../assets/banner5.webp";
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Hero = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div className="embla1 overflow-hidden relative" ref={emblaRef}>
      {/* Use Map in this div when Admin added images */}
      <div className="embla__container1 flex">
        <div className="embla__slide1"><img src={banner3} className="w-full max-h-[600px] object-cover" /></div>
        <div className="embla__slide1"><img src={banner2} className="w-full max-h-[600px] object-cover" /></div>
        <div className="embla__slide1"><img src={banner5} className="w-full max-h-[600px] object-cover" /></div>
        <div className="embla__slide1"><img src={banner4} className="w-full max-h-[600px] object-cover" /></div>
        <div className="embla__slide1"><img src={banner1} className="w-full max-h-[600px] object-cover" /></div>
      </div>

      <button className="embla__prev absolute top-1/2 left-0 transform -translate-y-1/2 ml-4 bg-violet2 rounded-md p-2" onClick={scrollPrev}>
        <ChevronLeft className="text-white" />
      </button>

      <button className="embla__prev absolute top-1/2 right-0 transform -translate-y-1/2 bg-violet2 mr-4 rounded-md p-2" onClick={scrollNext}>
        <ChevronRight className="text-white" />
      </button>
    </div>

    // <div>
    //     <img src={hero} className="w-full max-h-[600px] object-cover" />
    // </div>
  )
}

export default Hero;