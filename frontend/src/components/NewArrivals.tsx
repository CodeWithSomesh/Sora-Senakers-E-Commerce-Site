import { useCallback, useEffect, useState } from 'react'
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { ChevronLeft, ChevronRight, CirclePause, CirclePlay } from 'lucide-react'
import shoe1 from "../assets/shoe2.webp";
import { useGetProduct } from '@/api/ProductsApi'
import { Product } from '@/types'
import { Link } from 'react-router-dom'

type PropType = {
  slides: number[]
  options?: EmblaOptionsType
}

const NewArrivals: React.FC<PropType> = (props) => {
    const { product } = useGetProduct(); //Retrieving All products from the DB 
    const [hoveredProduct, setHoveredProduct] = useState<{ [key: string]: boolean }>({}); // State to track the hover state for each product

    // Filter products to only include those with productCategory "men"
    const filteredProducts = Array.isArray(product) ? product.filter(shoe => shoe.productTags === 'newArrivals') : [];

    const transformTag = (tag:string) => {
        switch (tag) {
          case 'newArrivals':
            return 'New Arrivals';
          case 'bestSelling':
            return 'Best Selling';
          case 'noTags':
            return false; // Hide "No Tags"
          default:
            return `${tag}% OFF`;
        }
    };


    const { slides, options } = props
    const [emblaRef, emblaApi] = useEmblaCarousel(options, [
      AutoScroll({ playOnInit: true }),
    ])
    const [isPlaying, setIsPlaying] = useState(false)
  
    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])
    
    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])
  
  
    const toggleAutoplay = useCallback(() => {
      const autoScroll = emblaApi?.plugins()?.autoScroll
      if (!autoScroll) return
  
      const playOrStop = autoScroll.isPlaying()
        ? autoScroll.stop
        : autoScroll.play
      playOrStop()
    }, [emblaApi])
  
    useEffect(() => {
      const autoScroll = emblaApi?.plugins()?.autoScroll
      if (!autoScroll) return
  
      setIsPlaying(autoScroll.isPlaying())
      emblaApi
        .on('autoScroll:play', () => setIsPlaying(true))
        .on('autoScroll:stop', () => setIsPlaying(false))
        .on('reInit', () => setIsPlaying(autoScroll.isPlaying()))
    }, [emblaApi])
  
    return (
        <div className='relative'>
            <h1 className='text-center border py-6 font-inter text-5xl font-bold italic text-white hover:text-black bg-violet3'>New Arrivals</h1>
            <div className="embla">
                <div className="embla__viewport" ref={emblaRef}>
                    <div className="embla__container">
                        {filteredProducts.map((shoe: Product) => {
                            const newTag = transformTag(shoe.productTags)

                            return (
                                <Link to={`/products/${shoe._id}`} className="embla__slide m-4" key={shoe.productCode}>
                                    
                                    <div className="w-[520px] flex flex-col  items-center rounded-lg border border-gray-400 h-full relative"
                                    onMouseEnter={() => setHoveredProduct(prevState => ({ ...prevState, [shoe.productCode]: true }))} 
                                    onMouseLeave={() => setHoveredProduct(prevState => ({ ...prevState, [shoe.productCode]: false }))}>
                                        <img 
                                        src={`http://localhost:7000/uploads/${hoveredProduct[shoe.productCode] ? shoe.productImages[1] : shoe.productImages[0]}`}
                                        height={20} width={320} alt="Shoe Image" className='' /> 

                                        <p className={`absolute italic top-4 right-4 text-nowrap h-fit font-semibold text-[21px] rounded-full text-white px-6 py-2 text-green-60 ${newTag ? "bg-[#836FFF]" : ""} `}>{newTag}</p>

                                        <div className="flex justify-between w-full px-4  font-inter gap-10 py-4 border-t items-center h-full">
                                            <p className='text-[21px] font-medium'>{(shoe.productName).toUpperCase()}</p>
                                            <p className='text-nowrap h-fit font-extrabold text-[24px] rounded-full bg-green-100 px-6 py-2 text-green-60'>RM {Number(shoe.productPrice).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
        
                <div className="embla__controls flex justify-center mt-8">
                    <button className="embla__prev  bg-black rounded-full p-2" onClick={scrollPrev}>
                        <ChevronLeft className="text-white" />
                    </button>

                    <button className="embla__play" onClick={toggleAutoplay} type="button">
                        {isPlaying ? <CirclePause className='w-[40px] h-[40px]' /> : <CirclePlay className='w-[40px] h-[40px]' />}
                    </button>

                    <button className="embla__prev   bg-black rounded-full p-2" onClick={scrollNext}>
                        <ChevronRight className="text-white" />
                    </button>
                    
                </div>
            </div>

        </div>
      
    )
}

export default NewArrivals