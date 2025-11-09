import { useGetProduct } from "@/api/ProductsApi";
import Counter from "@/components/Counter";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Product } from "@/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserProfilePage from "./UserProfilePage";
import axios from "axios";
import { toast } from "sonner";
import { useGetMyUser } from "@/api/MyUserApi";
import Swal from "sweetalert2";

const PaymentPage = () => {
    const [quantity, setQuantity] = useState(1)

    const { product } = useGetProduct(); //Retrieving All products from the DB 
    const { currentUser, isLoading: isGetLoading} = useGetMyUser();

    const navigate = useNavigate();
    const location = useLocation(); // Retrieving the path of the current page
    const path = location.pathname

    const parts = path.split("/"); //Filtering the product id from the code
    const id = parts[parts.length - 1]; 

    // Filter products to only include those with this specific productID
    const filteredProduct = Array.isArray(product) ? product.filter(shoe => shoe._id === id) : [];
    //console.log(filteredProduct[0].productName)

    const redirectPage = () => {
        navigate(`/`)
    }

    const createOrder = async (orderData: any) => {
      try {
          if (quantity < 1){
            toast.error('Select more than 1 quantity');
            return ;
          }

          const response = await axios.post("http://localhost:7000/api/order", orderData);
          toast.success('Order Created Successfully');

          Swal.fire({
            title: "Success!",
            text: "Congratulations! Your order has been successfully placed.",
            icon: "success"
          });

          return response.data;
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred while creating an order');
      }
    };

    const handleCreateOrder = async () => {
      try {
          const orderData = {
              userId: currentUser?._id,  
              productId: id,  
              productPrice: filteredProduct[0].productPrice,  
              numOfItems: quantity,  
              totalPrice: ((parseFloat(filteredProduct[0].productPrice) * quantity).toFixed(2)).toString(),  
          };

          const createdOrder = await createOrder(orderData);
          console.log("Order created successfully:", createdOrder);
      } catch (error) {
          console.error("Error creating order:", error);
      }
  };

  return (
    <div>
        <div className="px-20 ">
          <Table className='font-inter py-4 '>
            {/* <TableCaption className='text-xl '>List Of Your Added Products</TableCaption> */}
            <TableHeader className='border-y-2 '>
              <TableRow className='font-extrabold'>
              <TableHead className="min-w-[700px] font-extrabold text-[17px]">Product</TableHead>
                <TableHead className="w-[200px] font-extrabold text-[17px] py-4 text-center">Quantity</TableHead>
                <TableHead className="min-w-[120px] text-center font-extrabold text-[17px] py-4">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='border-b-2'>
              
                {Array.isArray(filteredProduct) && filteredProduct?.length > 0 && filteredProduct?.map((shoe: Product) =>  (
                  <TableRow key={shoe._id} className='text-[16px] font-inter '>
                    <TableCell className="font-medium py-5 pr-4 flex items-center">
                        <img src={`http://localhost:7000/uploads/${shoe.productImages[0]}`} alt="Product Image" width={300} />
                        <TableCell className="font-medium text-lg py-5 pr-4 w-[400px] text-pretty ml-4">{shoe.productName}</TableCell>
                    </TableCell>

                    <TableCell className="font-medium text-violet2 py-5 pr-4 text-center">
                        <div className="flex gap-4">
                            <Counter quantity={1} setQuantity={setQuantity} /> 
                            <Button className="py-[19px] px-3 bg-[#f23c36] hover:bg-red-500  hover:opacity-80" onClick={redirectPage}>
                                <Trash2 width={21} />
                            </Button>
                        </div>
                    </TableCell>

                    <TableCell className="font-bold py-5 pr-4 text-center text-xl italic">RM {(parseFloat(shoe.productPrice) * quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                
              
            </TableBody>
          </Table>
          

          <Button type="submit" onClick={handleCreateOrder} className="bg-violet2 text-2xl p-8 hover:bg-black hover:text-violet2 font-bold w-full font-inter mt-6">
            Purchase
          </Button>
        </div>
    </div>
  )
}

export default PaymentPage