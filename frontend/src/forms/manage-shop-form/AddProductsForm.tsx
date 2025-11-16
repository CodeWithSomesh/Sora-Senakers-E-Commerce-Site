import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import DetailsSection from "./DetailsSection";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import ProductImageSection from "./ProductImageSection";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "@/context/SidebarContext";



//////////////////////////////// Using Zod to validate all the form inputs ////////////////////////////////
//////////////////////////////// Zod From Schema ////////////////////////////////
const formSchema = z.object({
    productName: z.string({
        required_error: "Product Name is required",
    }),
    productCode: z.string({
        required_error: "Product Code is required",
    }),
    productPrice: z.coerce.number({
        required_error: "Product Price is required",
        invalid_type_error: "Must be a valid number",
    }).min(10, { message: "Product Price should be at least RM10" }),

    productStock: z.coerce.number({
        required_error: "Product Stock is required",
        invalid_type_error: "Must be a valid integer",
    }).int().min(10, { message: "Product Stock should be at least 10" }),

    productCategory: z.string().optional(),

    productSizes: z.array(z.string()).optional(),

    productDescription: z.string({
        required_error: "Product Description is required",
    }).min(100, { message: "Product Description should be at least 100 characters long" }),

    productTags: z.string().optional(),

    productImages: z.array(z.string()).optional(),
})

// Creating types for FormSchema
type ProductFormData = z.infer<typeof formSchema>

// Creating Types for the AddProductsForm below
type Props = {
    product?: Product; // Update the type to an array of Product
    onSave: (shopFormData: FormData) => void;
    isLoading: boolean;
    redirectPath: string;
}

///////////////////////////////// ADD PRODUCTS FORM /////////////////////////////////////
const AddProductsForm = ({ onSave, isLoading, product, redirectPath }: Props) => {
    // Declaring states for category, product sizes and product tags
    const [selectedCategory, setSelectedCategory] = useState<string>('men');
    const [productSizes, setProductSizes] = useState<string[]>([]);
    const [productTag, setProductTag] = useState<string>('newArrivals');
    const [addedPhotos, setAddedPhotos] = useState<string[]>([]);
    const navigate = useNavigate();
    const { isCollapsed } = useSidebar();

    const location = useLocation(); // Retrieving the path of the current page
    const path = location.pathname

    const parts = path.split("/"); //Filtering the product id from the code
    const id = parts[parts.length - 1]; 

    // Filter products to only include those with this specific productID
    const filteredProduct = Array.isArray(product) ? product.filter(shoe => shoe._id === id) : undefined;

    useEffect(() => {
        if (filteredProduct && filteredProduct.length > 0) {
            setAddedPhotos(filteredProduct[0].productImages);
        }
    }, [filteredProduct]);

    useEffect(() => {
        if (redirectPath) {
            navigate('/admin/manageProducts');
        }
    }, [redirectPath, navigate]);
    
    // console.log("hi")
    // console.log(product)
    //console.log(filteredProduct[0])

    
    // Passing the Validations Form Schema 
    const form = useForm<ProductFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: filteredProduct ? filteredProduct[0] : {}
    });

    // Used for updating Products
    useEffect(() => {
        if (!filteredProduct || filteredProduct.length === 0) {
            return;
        }

    

    }, [form, filteredProduct]);

    
    const onSubmit = (formDataJson: ProductFormData) => {
        // TODO - convert formDataJson to a new FormData object
        const formData= new FormData();

        if (productSizes.length <= 0){
            toast.error('Please select at least 1 Product Size');
            return
        }

        if (addedPhotos.length <= 0){
            toast.error('Please Upload at least 1 Product Image');
            return
        }

        if (addedPhotos.length > 5){
            toast.error('Only 5 Product Images at Max is allowed');
            //addedPhotos.pop()
            return
        }



        formData.append("productName", formDataJson.productName);
        formData.append("productCode", formDataJson.productCode);
        formData.append(
            "productPrice", 
            (formDataJson.productPrice).toString()
        );
        formData.append("productStock", (formDataJson.productStock).toString());
        formData.append("productCategory", selectedCategory);
        productSizes.forEach((size, index) => {
            formData.append(`productSizes[${index}]`, size);
        });
        formData.append("productDescription", formDataJson.productDescription);
        formData.append("productTags", productTag);
        addedPhotos.forEach((photo, index) => {
            formData.append(`productImages[${index}]`, photo);
        });


        onSave(formData);
    };

    return(
        <div className="flex">
            <AdminSidebar />
            <Form {...form}>

                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className={`space-y-8 bg-gray-50 px-4 md:px-6 lg:px-10 pb-10 py-4 rounded-lg w-full ml-0 pt-16 lg:pt-4 transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[350px]'}`}
                    >
                        
                        <DetailsSection 
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            productSizes={productSizes}
                            setProductSizes={setProductSizes}
                            productTag={productTag}
                            setProductTag={setProductTag}
                            //product={product}
                        />

                        <ProductImageSection 
                            addedPhotos={addedPhotos}
                            setAddedPhotos={setAddedPhotos}
            
                        />

                        {isLoading ? <LoadingButton/> : 
                            <Button type="submit" className="bg-violet2 text-2xl p-8 hover:bg-black hover:text-violet2 font-bold w-full font-inter">
                                {path == "/admin/addProducts" ? "Add Product" : "Update Product"}
                            </Button> 
                        }
                    </form>
                
            </Form>
        </div>
    )
};

export default AddProductsForm;