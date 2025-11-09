import type { SizeStock } from "../types";
import { Card, CardHeader, CardTitle } from "./ui/card";

type Props = {
    sizeStock: SizeStock;
    addToCart: () => void;
};

const SizeStock = ({ sizeStock, addToCart }: Props) => {
    return (
        <Card className="cursor-pointer" onClick={addToCart}>
            <CardHeader>
                <CardTitle>{sizeStock.size}</CardTitle>
            </CardHeader>
        </Card>
    );

};

export default SizeStock;