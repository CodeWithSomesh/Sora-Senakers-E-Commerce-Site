import { useGetProduct } from '@/api/ProductsApi';
import Counter from '@/components/Counter';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import React, { useEffect, useState } from 'react'
import { redirect, useLocation, useNavigate } from 'react-router-dom';
import MenProductPage from './MenProductPage';
import WomenProductPage from './WomenProductPage';
import KidsProductPage from './KidsProductPage';
import ShareSocialLinks from '@/components/ShareSocialLinks';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

const ProductDetailsPage = () => {
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedImg, setSelectedImg] = useState(0)
    
    console.log(selectedSize)

    const { product } = useGetProduct(); //Retrieving All products from the DB 

    const navigate = useNavigate();
    const location = useLocation(); // Retrieving the path of the current page
    const path = location.pathname

    const parts = path.split("/"); //Filtering the product id from the code
    const id = parts[parts.length - 1]; 

    // Filter products to only include those with this specific productID
    const filteredProduct = Array.isArray(product) ? product.filter(shoe => shoe._id === id) : [];
    const productCategory = filteredProduct.length > 0 ? filteredProduct[0].productCategory : null; //Getting Product Category

    useEffect(() => {
        // Scroll to top when the component mounts
        window.scrollTo(0, 0);
    }, []);

    
    const redirectToPayment = () => {
        if(selectedSize){
            navigate(`/user-profile/${id}`)
        } 
        else {
            toast.error('Select a Size first.');
        }
    }

    const displayOutOfStockMessage = () => {

        toast.error('Sorry, the selected shoes are currently out of stock. Please check back later for availability. Any inconvenience cause is regretted');
        Swal.fire({
            title: "Sorry",
            text: "Sorry, the selected shoes are currently out of stock. Please check back later for availability. Any inconvenience cause is regretted",
            icon: "error"
          });
    }

  return (
    <div  className="">
        {filteredProduct.map((shoe: Product) => {
            // let imgSrc = `http://localhost:7000/uploads/${shoe.productImages[index]}`
            return (
            <div className=''>
                <div className='grid grid-cols-[10%_50%_40%] container mx-auto flex-1 py-10' >
                    {/* Small Images Rows */}
                    <div className='flex flex-col'>
                        <div className=''>
                            {shoe.productImages.map((img, index) => {
                                let imgSrc = `http://localhost:7000/uploads/${shoe.productImages[index]}`  

                                return (
                                <img onClick={() => setSelectedImg(index)}
                                src={imgSrc}
                                height={20} width={320} alt="All Product Images" 
                                className={`border 
                                    ${imgSrc == `http://localhost:7000/uploads/${shoe.productImages[selectedImg]}` ? "border border-2 border-black shadow-2xl" : " border-gray-400 "} `} /> 
                            )})}

                        </div>
                    
                    </div>

                    {/* Large Images Box */}
                    <div className='px' >
                        <img 
                        src={`http://localhost:7000/uploads/${shoe.productImages[selectedImg]}`}
                        height={60} width={670} alt="" className='object-cover' />

                    </div>
                    

                    {/* Product Details */}
                    <div className='ml-4'>
                        <h1 className='text-[32px] font-[600] italic min-h-[50px] font-inter'>{(shoe.productName).toUpperCase()}</h1>
                        <p className='font-mono mt-1 text-[18px]' >SKU: {shoe.productCode}</p>
                        
                        <div className='my-8 flex justify-between items-center h-[50px]'>
                            <p className='font-inter font-semibold text-4xl' >RM {Number(shoe.productPrice).toFixed(2)}</p>

                            <ShareSocialLinks />
                        </div>
                        
                        
                        <h1 className='font-mono font-medium text-[18px] mb-2'>CHOOSE YOUR SIZE:</h1>
                        <div className='grid grid-cols-3 gap-2' >
                            {shoe.productSizes.map((size) => (
                                <Button onClick={() => {setSelectedSize(size)}}
                                className={`border-[4px] border-black py-5 text-center rounded-none font-bold text-[16px] hover:bg-violet2 transition-all ${selectedSize == size ? "bg-violet2" : "bg-[#0F172A]"}`}>
                                    {size}
                                </Button>
                            ))}
                        </div>

                        <h1 className='min-h-[50px] font-inter my-12 leading-7'>{shoe.productDescription}</h1>
                        
                        {Number(shoe.productStock) < 11 && Number(shoe.productStock) > 0 ? (
                            <h1 className='font-inter my-5 text-red-400 text-xl font-medium italic animate-bounce'>
                                Act fast! Only {shoe.productStock} pairs of these stylish shoes left in stock. Grab yours before they're gone!
                            </h1>
                        ) :
                        (
                            <h1></h1>
                        ) }

                        <div className='flex justify-between items-end' >
                            <div>
                                <h1 className='font-mono font-medium text-[18px] mb-2'>QUANTITY:</h1>
                                <Counter quantity={0} />
                            </div>

                            {Number(shoe.productStock) <= 0 ? (
                                <Button onClick={displayOutOfStockMessage} className='border-[4px] border-black bg-red-500 py-7 px-20 text-center italic rounded-full font-inter font-bold text-[16px] hover:bg-red-700 transition-all'>
                                    <h1 className='text-[22px]'>OUT OF STOCK</h1>
                                </Button>
                            ) :
                            (
                                <Button onClick={redirectToPayment} className='border-[4px] border-black bg-violet2 py-7 px-24 text-center rounded-full font-inter font-bold text-[16px] hover:bg-black transition-all'>
                                    <h1 className='text-[22px]'>Buy Now</h1>
                                </Button>
                            ) }
                        </div>
                    </div>
                </div>

                <h1 className='mt-16 text-center text-[40px] font-extrabold 
                italic min-h-[50px] font-inter bg-violet2 py-4 text-white hover:text-black'>
                    YOU MAY ALSO LIKE
                </h1>


                    
                {productCategory === "men" && <MenProductPage />}
                {productCategory === "women" && <WomenProductPage />}
                {productCategory === "kids" && <KidsProductPage />}
                    

            </div>
        )})}
        
    </div>
  )
}

export default ProductDetailsPage