import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AsSeenOnSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <div>
        <h1 className='text-center border py-6 font-inter text-5xl font-bold italic text-white bg-violet3'>As Seen On</h1>
    </div>
  )
}

export default AsSeenOnSection