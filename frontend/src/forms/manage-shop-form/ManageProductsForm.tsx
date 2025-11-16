import { useGetProduct } from '@/api/ProductsApi';
import AdminSidebar from '@/components/AdminSidebar'
import AlertButton from '@/components/AlertButton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Product } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useSidebar } from '@/context/SidebarContext';


const ManageProductsForm = () => {
  // ALL STATES
  const { product } = useGetProduct(); //Retrieving All products from the DB
  const [searchTerm, setSearchTerm] = useState('')
  const [productList, setProductList] = useState<Product[]>([]);
  const { isCollapsed } = useSidebar();

  // Initialize productList with products once they are loaded
  useEffect(() => {
    if (Array.isArray(product)) {
      setProductList(product);
    }
  }, [product]);

  // SEARCHBAR FILTER FUNCTION
  function searchFilter(product: Product) {
    if (searchTerm.toLowerCase() === ''){ 
      //If nothing is typed in SearchBar, then return nothing 
      return product;
    }  else {
      //Filter the products with address, ONLY display the products that includes the typed searchTerm
      return product.productName.toLowerCase().includes(searchTerm.toLowerCase()); 
    }
  }

  // After Product is deleted using handleDelete function in AlertButton.tsx, 
  // it will be filtered out from the list of products displayed in this page
  const handleProductDelete = (productId: string) => {
    setProductList(productList.filter(product => product._id !== productId));
  };

  //Function to Capitalize the first letter in the word
  function capitalizeFirstLetter(string:string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
 


  return (
    <div className=''>
        <AdminSidebar />


        <div className={`space-y-6 bg-gray-50 px-4 md:px-6 lg:px-10 min-h-screen py-4 ml-0 pt-16 lg:pt-3 transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[350px]'}`}>

          <Input type="email" placeholder="Search by Product Name..." onChange={e => setSearchTerm(e.target.value)}
          className='border-gray-400 py-6 text-lg font-inter font-medium italic'  />

          <Table className='font-inter py-4 '>
            {/* <TableCaption className='text-xl '>List Of Your Added Products</TableCaption> */}
            <TableHeader className='border-y-2 '>
              <TableRow className='font-extrabold'>
                <TableHead className="min-w-[220px] font-extrabold text-[17px]">Code</TableHead>
                <TableHead className='font-extrabold text-[17px]  px-2 w-[400px]'>Name</TableHead>
                <TableHead className="w-[150px] font-extrabold text-[17px] py-4 text-center">Price</TableHead>
                <TableHead className="w-[150px] font-extrabold text-[17px] py-4 text-center">Stock</TableHead>
                <TableHead className="w-[120px] text-center font-extrabold text-[17px] py-4">Category</TableHead>
                <TableHead className="w-[120px] text-center font-extrabold text-[17px] py-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='border-b-2'>
              
                {Array.isArray(productList) && productList?.length > 0 && productList?.filter(searchFilter).map((shoe: Product) =>  (
                  <TableRow key={shoe._id} className={`text-[16px] font-inter`}>
                    <TableCell className={`font-medium text-violet2 py-5 pr-4 ${Number(shoe.productStock) < 11 ? "text-red-500" : "" } `}>SKU: {shoe.productCode}</TableCell>
                    <TableCell className={`font-medium py-5 pr-6 ${Number(shoe.productStock) < 11 ? "text-red-500" : "" }`}>
                      <Link to={`/products/${shoe._id}`} className='hover:italic hover:underline' target='_blank'>
                        {shoe.productName}
                      </Link> 
                    </TableCell>
                    <TableCell className={`font-medium py-5 pr-4 text-center ${Number(shoe.productStock) < 11 ? "text-red-500" : "" }`}>RM {shoe.productPrice}</TableCell>
                    <TableCell className={`font-medium py-5 pr-4 text-center ${Number(shoe.productStock) < 11 ? "text-red-500" : "" }`}>{shoe.productStock}</TableCell>
                    <TableCell className={`font-medium py-5 pr-4 text-center ${Number(shoe.productStock) < 11 ? "text-red-500" : "" }`}>{capitalizeFirstLetter(shoe.productCategory)}</TableCell>
                    <TableCell className={`font-medium py-5 pr-4 text-center ${Number(shoe.productStock) < 11 ? "text-red-500" : "" }`}>
                      <div className='flex gap-2 items-center justify-center'>
                        <Button className='py-5 px-3 hover:bg-violet2'>
                          <Link to={`/admin/manageProducts/update/${shoe._id}`}>
                            <Pencil width={21} className=''/>
                          </Link>
                        </Button>

                        <AlertButton productId={shoe._id} onDelete={handleProductDelete} />
                      </div>
                    </TableCell>

                  </TableRow>
                ))}
                
              
            </TableBody>
          </Table>

        </div>
    </div>
  )
}

export default ManageProductsForm