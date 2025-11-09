import { useGetProduct } from '@/api/ProductsApi';
import { Product } from '@/types';
import Counter from '@/components/Counter';
import { useState } from 'react';
import FilteringDropdown from '@/components/FilteringDropdown';
import { Link, useLocation } from 'react-router-dom';


type FilterTerm = string | undefined;

const WomenProductPage: React.FC = () => {
  
  // State to track the hover state for each product
  const [hoveredProduct, setHoveredProduct] = useState<{ [key: string]: boolean }>({});
  const [filterTerm, setFilterTerm] = useState<FilterTerm>(undefined);

  const { product } = useGetProduct(); //Retrieving All products from the DB 
  //console.log(product)

  const location = useLocation(); // Retrieving the path of the current page
  const path = location.pathname


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

  // Filter products to only include those with productCategory "men"
  const filteredProducts = Array.isArray(product) ? product.filter(shoe => shoe.productCategory === 'women') : [];


  // Function to filter products by product tag
  const filterProductsByTag = (products: Product[], tag: string): Product[] => {
    if (!products) return [];

    return products.filter(product => product.productTags === tag);
  };


  // Function to sort products by name
  const sortProductsByName = (products: Product[], ascending: boolean): Product[] => {
    return products.sort((a, b) => { //Comparing 2 products
      if (a.productName < b.productName) return ascending ? -1 : 1; // -1 means before, 1 means after
      if (a.productName > b.productName) return ascending ? 1 : -1;
      return 0; //If the names are equal, it returns 0
    });
  };


  // Function to sort products by price
  const sortProductsByPrice = (products: Product[], ascending: boolean): Product[] => {
    return products.sort((a, b) => { //Comparing 2 products
      return ascending
        ? a.productPrice - b.productPrice // -1 means before, 1 means after
        : b.productPrice - a.productPrice;
    });
  };


  // Function to sort products by creation date
  const sortProductsByDate = (products: Product[], ascending: boolean): Product[] => {
    return products.sort((a, b) => { //Comparing 2 products
      const dateA = new Date(a.productCreatedAt); // -1 means before, 1 means after
      const dateB = new Date(b.productCreatedAt);
      return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
  };


  // Determine the filtered and sorted products based on the filterTerm
  let newlyFilteredProducts: Product[] = [];


  // Filtering by tag
  if (filterTerm === 'bestSelling' || filterTerm === 'newArrivals') {
    newlyFilteredProducts = filterProductsByTag(filteredProducts, filterTerm);
  } 

  else if (filterTerm === 'onSale') {  // Filtering by sale offer
    filteredProducts.forEach(product => {
      const offer = parseInt(product.productTags, 10); //Turning offer string into integer
      if (offer) {
        newlyFilteredProducts = filteredProducts.filter(product => product.productTags === offer.toString());
      }
    });
  } 
  
  else if (filterTerm === 'alphabetsAscending') { // Sorting by name in ascending order
    newlyFilteredProducts = sortProductsByName(filteredProducts, true);
  } 
  
  else if (filterTerm === 'alphabetsDescending') { // Sorting by name in descending order
    newlyFilteredProducts = sortProductsByName(filteredProducts, false);
  } 
  
  else if (filterTerm === 'priceAscending') { // Sorting by price in ascending order
    newlyFilteredProducts = sortProductsByPrice(filteredProducts, true);
  } 
  
  else if (filterTerm === 'PriceDescending') {  // Sorting by price in descending order
    newlyFilteredProducts = sortProductsByPrice(filteredProducts, false);
  } 
  
  else if (filterTerm === 'dateAscending') { // Sorting by date in ascending order
    newlyFilteredProducts = sortProductsByDate(filteredProducts, true);
  } 
  
  else if (filterTerm === 'dateDescending') { // Sorting by date in descending order
    newlyFilteredProducts = sortProductsByDate(filteredProducts, false);
  } 
  
  else if (filterTerm === 'all') { // Showing all products
    newlyFilteredProducts = filteredProducts;
    setFilterTerm(undefined);
  } 
  
  else {
    newlyFilteredProducts = filteredProducts;
  }



  return (
    <div>
      {path === "/womenProducts" && <FilteringDropdown filterTerm={filterTerm} setFilterTerm={setFilterTerm} />}

      <div className="container mx-auto flex-1 py-10">
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols- gap-6 '>
          {!filterTerm && filteredProducts.map((shoe: Product) => {
            const newTag = transformTag(shoe.productTags)
            const offer  = typeof newTag === "string" ? parseInt(newTag, 10) : 0;


            return (
              <div>
                <Link to={`/products/${shoe._id}`}  key={shoe.productCode} className=' flex flex-col items-center rounded-lg border h-full border-gray-400 shadow-lg transition-all hover:shadow-2xl hover:scale-105'>
                  <div  className='border-b w-full items-center justify-center flex rounded-sm border-gray-300 relative' 
                    onMouseEnter={() => setHoveredProduct(prevState => ({ ...prevState, [shoe.productCode]: true }))} 
                    onMouseLeave={() => setHoveredProduct(prevState => ({ ...prevState, [shoe.productCode]: false }))}>
                        <img 
                        src={`http://localhost:7000/uploads/${hoveredProduct[shoe.productCode] ? shoe.productImages[1] : shoe.productImages[0]}`}
                        height={20} width={320} alt="" className='min-h-[320px]' />

                        <p className={`absolute italic top-4 right-4 text-nowrap h-fit font-semibold text-[18px] rounded-full text-white px-6 py-2 text-green-60 ${newTag ? "bg-[#836FFF]" : ""} `}>{newTag}</p>
                  </div>

                  <div className='flex flex-col h-full  w-full px-4 font-inter gap-10 pt-4 pb-5 '>
                    <h1 className='text-[18px] font-bold min-h-[50px]'>{(shoe.productName).toUpperCase()}</h1>

                    <div className='flex justify-between h-full items-end'>
                      {offer > 0 ? (
                        <div className=''>
                          <p className='text-nowrap h-fit font-extrabold text-[20px] rounded-full  px-6 py- text-center line-through italic'>RM {Number(shoe.productPrice).toFixed(2)}</p>
                          <p className='text-nowrap h-fit font-extrabold text-[20px] rounded-full bg-green-100 px-6 py-2 text-green-60'>RM {(Number(shoe.productPrice) - (Number(shoe.productPrice) * offer/100 )).toFixed(2)}</p>
                            
                        </div>
                      )
                      : (
                        <p className='text-nowrap h-fit font-extrabold text-[20px] rounded-full bg-green-100 px-6 py-2 text-green-60'>RM {Number(shoe.productPrice).toFixed(2)}</p>
                      )
                    }


                      <Counter quantity={0} />
                    </div>
                  </div>
                </Link>
              </div>
              
          )})}


          {filterTerm && newlyFilteredProducts?.map((shoe: Product) => {
            const newTag = transformTag(shoe.productTags)
            const offer  = typeof newTag === "string" ? parseInt(newTag, 10) : 0;


            return (
              <div>
                <Link to={`/products/${shoe._id}`} key={shoe.productCode} className=' flex flex-col items-center rounded-lg border h-full border-gray-400 shadow-lg transition-all hover:shadow-2xl hover:scale-105'>
                  <div  className='border-b w-full items-center justify-center flex rounded-sm border-gray-300 relative' 
                    onMouseEnter={() => setHoveredProduct(prevState => ({ ...prevState, [shoe.productCode]: true }))} 
                    onMouseLeave={() => setHoveredProduct(prevState => ({ ...prevState, [shoe.productCode]: false }))}>
                        <img 
                        src={`http://localhost:7000/uploads/${hoveredProduct[shoe.productCode] ? shoe.productImages[1] : shoe.productImages[0]}`}
                        height={20} width={320} alt="" className='' />

                        <p className={`absolute italic top-4 right-4 text-nowrap h-fit font-semibold text-[18px] rounded-full text-white px-6 py-2 text-green-60 ${newTag ? "bg-[#836FFF]" : ""} `}>{newTag}</p>
                  </div>

                  <div className='flex flex-col h-full  w-full px-4 font-inter gap-10 pt-4 pb-5 '>
                    <h1 className='text-[18px] font-bold min-h-[50px]'>{(shoe.productName).toUpperCase()}</h1>

                    <div className='flex justify-between h-full items-end'>
                      {offer > 0 ? (
                        <div className=''>
                          <p className='text-nowrap h-fit font-extrabold text-[20px] rounded-full  px-6 py- text-center line-through italic'>RM {Number(shoe.productPrice).toFixed(2)}</p>
                          <p className='text-nowrap h-fit font-extrabold text-[20px] rounded-full bg-green-100 px-6 py-2 text-green-60'>RM {(Number(shoe.productPrice) * offer/100 ).toFixed(2)}</p>
                            
                        </div>
                      )
                      : (
                        <p className='text-nowrap h-fit font-extrabold text-[20px] rounded-full bg-green-100 px-6 py-2 text-green-60'>RM {Number(shoe.productPrice).toFixed(2)}</p>
                      )
                    }


                      <Counter quantity={0} />
                    </div>
                  </div>
                </Link>
              </div>
              
          )})}

                
        </div>

      </div>
      


    </div>
    
  )
}

export default WomenProductPage