import { Request, Response } from "express";
import Shop from "../models/product";

const getShop = async (req: Request, res: Response) => {
    try {
        const shopId = req.params.shopId;

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: "shop not found "})
        }

        res.json(shop);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "something went wrong"})
    }
}


const searchShop = async (req: Request, res:Response) => {
    try {
        const color = req.params.color;

        const searchQuery = (req.query.searchQuery as string) || "";
        const selectedCategory = req.query.selectedCategory as string || "";
        const sortOption = (req.query.sortOption as string) || "lastUpdated";
        const page = parseInt(req.query.page as string) || 1 ;

        let query: any = {};

        query["color"] = new RegExp(color, "i");
        const colorCheck = await Shop.countDocuments(query);
        if (colorCheck === 0) {
            return res.status(404).json({  
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pages: 1,
                },
            });
        }

        if (selectedCategory) {
            const categoryArray = selectedCategory
                //spliting the selectedCategory with comma
                .split(",") 
                .map((category) => new RegExp(category, "i"));

            query["category"] = { $all: categoryArray };
        }

        if (searchQuery) {
            // shopName = AirMax Black
            // category = [men]
            // searchQuery = men
            const searchRegex = new RegExp(searchQuery, "i");
            query["$or"] = [
                { shopName: searchRegex },
                { category: { $in: [searchRegex]}},
            ];
        }

        
        //exp: were in page 2
        //So, in total we have more than 10 results
        // 20-10 , its gonna be only 1 page
        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        // sortOption = "lastUpdated"
        const shop = await Shop.find(query)
            .sort({ [sortOption]: 1 })
            .skip(skip)
            .limit(pageSize)
            .lean(); //returns as plain javascript object

        const total = await Shop.countDocuments(query);

        const response = {
            data: shop,
            pagination: {
                total,
                page,
                //if 50 results, pageSize = 10 > pages 5
                pages: Math.ceil(total / pageSize),
            },
        };


        res.json(response);
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export default{
    getShop,
    searchShop,
}