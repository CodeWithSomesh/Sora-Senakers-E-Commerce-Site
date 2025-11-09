import { useGetShop } from "@/api/ShopApi";
import OrderSummary from "@/components/OrderSummary";
import ShopInfo from "@/components/ShopInfo";
import SizeStock from "@/components/SizeStock";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useParams } from "react-router-dom";

export type CartItem = {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
}

const DetailPage = () => {
    const { shopId } = useParams();
    const { shop, isLoading } = useGetShop(shopId);

    const [cartItems, setCartItems ] = useState<CartItem[]>([]);

    const addToCart = (sizeStock: SizeStock) => {
        if (!shop) {
            return;
        }
        setCartItems((prevCartItems) =>{
            // 1. check if item is already in cart
            const existingCartItem = prevCartItems.find(
                (cartItem) => cartItem._id === sizeStock._id && cartItem.size === sizeStock.size
            );

            let updatedCartItems;

            // 2. if item is in cart, update the quantity
            if(existingCartItem) {
                updatedCartItems = prevCartItems.map((cartItem) =>
                    cartItem._id === sizeStock._id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }   else {
                updatedCartItems = [
                    ...prevCartItems, {
                        _id: sizeStock._id,
                        size: sizeStock.size,
                        // TODO: change to update stock control in db
                        //stock: sizeStock.stock,
                        name: shop.shopName,
                        price: shop.price,
                        quantity: 1,
                    }
                ]
            }

            // 3. if item is not in the cart, add it as a new item
            return updatedCartItems
        })
    };

    const removeFromCart = (cartItem: CartItem) => {
        setCartItems((prevCartItems) =>  {
            const updatedCartItems = prevCartItems.filter(
                (item) => cartItem._id !== item._id
            );

            return updatedCartItems;
        });
    };

    if (isLoading || !shop) {
        return "Loading...";
    }

    return (
        <div className="flex flex-col gap-10">
            <AspectRatio ratio={16 / 5}>
                <img src={shop.imageUrl} 
                className="rounded-md object-cover h-full w-full" 
                />
            </AspectRatio>
            <div className="grid md:grid-cols-[4fr_2fr] gap-5 md:px-32">
                <div className="flex flex-col gap-4">
                    <ShopInfo shop={shop} />
                    <span className="text-2xl font-bold tracking-tight">Menu</span>
                    {shop.sizeStock.map((sizeStock) => (
                        <SizeStock 
                            sizeStock={sizeStock} 
                            addToCart={() => addToCart(sizeStock)} 
                        />
                    ))}
                </div>

                <div>
                    <Card>
                        <OrderSummary 
                            shop={shop} 
                            cartItems={cartItems} 
                            removeFromCart={removeFromCart}
                        />
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default DetailPage;