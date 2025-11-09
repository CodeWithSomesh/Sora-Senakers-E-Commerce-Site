import { CartItem } from "@/pages/DetailPage";
import { Shop } from "@/types";
import { CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Trash2 } from "lucide-react";

type Props = {
    shop: Shop;
    cartItems: CartItem[];
    removeFromCart: (cartItem: CartItem) => void
}

const OrderSummary = ({ cartItems, removeFromCart }: Props) => {

    const getTotalCost = () => {
        const totalInRm = cartItems.reduce(
            (total, cartItem) => total + cartItem.price * cartItem.quantity, 
            0
        );

        const totalWithDelivery = totalInRm + 800;

        return (totalWithDelivery / 100).toFixed(2);
    };

    return (
        <>
            <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight flex justify-between"> 
                    <span>Your Order</span>
                    <span>RM{getTotalCost()}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                {cartItems.map((item) => (
                    <div key={`${item._id}-${item.size}`} className="flex justify-between">
                        <span>
                            <Badge variant="outline" className="mr-2">
                                {item.quantity}
                            </Badge>
                            {item.name}, {item.size}
                        </span>
                        <span className="flex items-center gap-1">
                            <Trash2
                                className="cursor-pointer" 
                                color="red" 
                                size={20}
                                onClick={() => removeFromCart(item)}
                            />
                            RM{((item.price * item.quantity) / 100).toFixed(2)}
                        </span>
                    </div>
                ))}
                <Separator/>
                <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>RM8.00</span>
                </div>
            </CardContent>
        </>
    )

}

export default OrderSummary;