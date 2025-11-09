import AdminSidebar from '@/components/AdminSidebar'
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import axios from 'axios';
import { useState } from 'react';
import { useQuery } from 'react-query';


const fetchAllOrders = async () => {
  const response = await axios.get("http://localhost:7000/api/order");
  return response.data;
};

const OrderDetails = () => {
  const [searchTerm, setSearchTerm] = useState('')

  // Retrieving all Orders from the DB 
  const { data: orders, isLoading, isError } = useQuery('orders', fetchAllOrders);
  console.log(orders)

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching orders</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // You can adjust the locale as needed
  }

  // SEARCHBAR FILTER FUNCTION
  function searchFilter(order: any) {
    if (searchTerm.toLowerCase() === ''){ 
      //If nothing is typed in SearchBar, then return nothing 
      return order;
    }  else {
      //Filter the products with address, ONLY display the products that includes the typed searchTerm
      return order.user?.name.toLowerCase().includes(searchTerm.toLowerCase()); 
    }
  }

  return (
    <div>
        <AdminSidebar />
        

        <div className="space-y-6 bg-gray-50 px-10 pb-10 py-4  ml-[350px] pt-3 min-h-screen">

          <Input type="email" placeholder="Search by Buyer Name..." onChange={e => setSearchTerm(e.target.value)}
          className='border-gray-400 py-6 text-lg font-inter font-medium italic'  />


          <Table className='font-inter py-4 '>
            {/* <TableCaption className='text-xl '>List Of Your Added Products</TableCaption> */}
            <TableHeader className='border-y-2 '>
              <TableRow className='font-extrabold'>
                <TableHead className="w-[200px] font-extrabold text-[17px]">Order ID</TableHead>
                <TableHead className="w-[260px] font-extrabold text-[17px]">Product Name</TableHead>
                <TableHead className="w-[150px] font-extrabold text-[17px] py-4 text-center">Buyer Name</TableHead>
                <TableHead className="w-[150px] font-extrabold text-[17px] py-4 text-center">Date</TableHead>
                <TableHead className="w-[120px] text-center font-extrabold text-[17px] py-4">Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='border-b-2'>
              
                {Array.isArray(orders) && orders?.length > 0 && orders?.filter(searchFilter).map((order) =>  (
                  <TableRow key={order._id} className='text-[16px] font-inter '>
                    <TableCell className="font-medium text-violet2 py-5 pr-">{order._id}</TableCell>
                    <TableCell className="font-medium py-5 pr-6">{order.product?.productName}</TableCell>
                    <TableCell className="font-medium py-5 pr-4 text-center">{order.user?.name}</TableCell>
                    <TableCell className="font-medium py-5 pr-4 text-center">{formatDate(order.orderCreatedAt)}</TableCell>
                    <TableCell className="font-medium py-5 pr-4 text-center">RM {order.totalPrice}</TableCell>
                  </TableRow>
                ))}
                
              
            </TableBody>
          </Table>

        </div>
    </div>
  )
}

export default OrderDetails