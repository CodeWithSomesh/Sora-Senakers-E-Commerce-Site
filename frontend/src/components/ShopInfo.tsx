import { Shop } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dot } from "lucide-react";

type Props = {
    shop: Shop
}

const ShopInfo = ({ shop }: Props) => {
    return (
        <Card className="border-sla">
            <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tight">
                    {shop.shopName}
                </CardTitle>
                <CardDescription>
                    {shop.color}, {shop.price}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex">
                {shop.category.map((item, index) => (
                    <span className="flex">
                        <span>{item}</span>
                        {/* dot only appears if it is not the last item on the array */}
                        {index < shop.category.length -1 && <Dot/>}
                    </span>
                ))}
            </CardContent>
        </Card>
    )

}

export default ShopInfo;