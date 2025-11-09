import { Shop } from "@/types";
import { Banknote, Dot } from "lucide-react";
import { Link } from "react-router-dom";
import { AspectRatio } from "./ui/aspect-ratio";

type Props = {
 shop: Shop;
};

const SearchResultCard = ({ shop }: Props) => {
    return (
        <Link 
            to={`/detail/${shop._id}`} 
            //group -> it creates hover effect to child component eventho user hover over parent component 
            className="grid lg:grid-cols-[2fr_3fr] gap-5 group"
            >
                <AspectRatio ratio={16 / 6}>
                    <img 
                        src={shop.imageUrl} 
                        className="rounded-md w-full h-full object-cover"
                    />
                </AspectRatio>
                <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:underline">
                        {shop.shopName}
                    </h3>
                    <div id="card-content" className="grid md:grid-cols-2 gap-2">
                        <div className="flex flex-row flex-wrap">
                            {shop.category.map((item, index) => (
                                <span className="flex">
                                    <span>{item}</span>
                                    {index < shop.category.length - 1 && <Dot />}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2 flex-col">
                            <div className="flex items-center gap-1">
                                <Banknote/>
                                RM {(shop.price /100).toFixed(2)} {/* 2 decimal points */}
                            </div>
                        </div>
                    </div>
                </div>   
        </Link>
    );
};

export default SearchResultCard;