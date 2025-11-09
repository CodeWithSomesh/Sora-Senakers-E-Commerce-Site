import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import DetailsSection from "./DetailsSection";
import { Separator } from "@radix-ui/react-separator";
import CategorySection from "./CategorySection";
import SizeSection from "./SizeSection";
import ImageSection from "./ImageSection";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Shop } from "@/types";
import { useEffect } from "react";

const formSchema = z.object({
    shopName: z.string({
        required_error: "shop name is required",
    }),
    color: z.string({
        required_error: "color name is required",
    }),
    price: z.coerce.number({
        required_error: "price name is required",
        invalid_type_error: "must be a valid number",
    }),
    category: z.array(z.string()).nonempty({
        message: "please select atleast one item"
    }),
    sizeStock: z.array(
        z.object({
            size: z.string().min(1, "size is required"),
            stock: z.coerce.number().min(1, "stock is required"),
        })
    ),
    imageUrl: z.string().optional(),
    imageFile: z.instanceof(File, { message: "image is required" }).optional(),
})
.refine((data) => data.imageUrl || data.imageFile, {
    message: "Either image URL or image File must be provided",
    path: ["imageFile"],
});

type ShopFormData = z.infer<typeof formSchema>

type Props = {
    shop?: Shop;
    onSave: (shopFormData: FormData) => void;
    isLoading: boolean;
}

const ManageShopForm = ({ onSave, isLoading, shop }: Props) => {
    const form = useForm<ShopFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: [],
            sizeStock: [{size:"", stock: 0 }],
        },
    });

    useEffect(() =>{
        if(!shop){
            return;
        }

        const priceFormatted = parseInt(
            (shop.price / 100).toFixed(2)//delete: dont need to 2dc decimal point
        );

        const sizeStockFormatted = shop.sizeStock.map((item)=> ({
            ...item,
            stock: parseInt((item.stock / 100).toFixed(2)),
        }));

        const updatedShop = {
            ...shop,
            price: priceFormatted,
            sizeStock: sizeStockFormatted,
        };

        form.reset(updatedShop);
    }, [form, shop]);

    const onSubmit = (formDataJson: ShopFormData) => {
        // TODO - convert formDataJson to a new FormData object
        const formData= new FormData();

        formData.append("shopName", formDataJson.shopName);
        formData.append("color", formDataJson.color);

        formData.append(
            "price", 
            (formDataJson.price * 100).toString()
        );

        formDataJson.category.forEach((category, index) => {
            formData.append(`category[${index}]`, category);
        });

        formDataJson.sizeStock.forEach((sizeStock, index) => {
            formData.append(`sizeStock[${index}][size]`, sizeStock.size)
            formData.append(
                `sizeStock[${index}][stock]`, 
                (sizeStock.stock * 100).toString()
            );
        });

        if (formDataJson.imageFile) {
            formData.append(`imageFile`, formDataJson.imageFile);
        }
        
        onSave(formData);
    };

    return(
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-8 bg-gray-50 p-10 rounded-lg"
            >
                <DetailsSection/>
                <Separator/>
                <CategorySection/>
                <Separator/>
                <SizeSection/>
                <Separator/>
                <ImageSection/>
                {isLoading ? <LoadingButton/> : <Button type="submit">Submit</Button> }
            </form>
        </Form>
    )
};

export default ManageShopForm;