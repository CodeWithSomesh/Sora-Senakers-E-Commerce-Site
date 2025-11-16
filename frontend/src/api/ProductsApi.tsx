import { Product } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { trackAdminAction } from "@/services/security.service";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//////////////// GET ALL PRODUCTS FROM DB FUNCTION ////////////////
export const useGetProduct = () => {

    const getProductRequest = async (): Promise<Product> => {

        const response = await fetch(`${API_BASE_URL}/api/my/shop`)

        if(!response.ok){
            throw new Error("Failed to get products from Database")
        }
        return response.json();
    };

    const { data: product, isLoading } = useQuery(
        "fetchProduct", 
        getProductRequest 
    );

    return { product, isLoading };
};

//////////////// CREATE NEW PRODUCT FUNCTION ////////////////
export const useCreateProduct = () => {
    const { getAccessTokenSilently } = useAuth0();
    
    //Function is going to accept the formData
    const createProductRequest = async(
        productFormData: FormData
    ):Promise<Product[]> => {
        const accessToken = await getAccessTokenSilently();
        
        // console.log('Form Data successfully reach here, fix the below response function')
        // console.log(productFormData)
        // console.log('Form data:', Array.from(productFormData.entries()));
        
        const response = await fetch(`${API_BASE_URL}/api/my/shop`,{
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                // 'Content-Type': 'multipart/form-data',
            },
            body: productFormData,
        });


        if(!response.ok){
            throw new Error("Failed to create shop");
        }

        return response.json();
    };

    const {
        mutate: createProduct,
        isLoading,
        isSuccess,
        error,
        data: createdProduct
    } = useMutation(createProductRequest, {
        /**
         * SECURITY TRACKING: Log product addition to admin activity log
         * Security Benefit: Complete audit trail of all product changes
         */
        onSuccess: async (data) => {
            try {
                const accessToken = await getAccessTokenSilently();
                const productName = data && data.length > 0 ? data[0].productName : "Unknown Product";
                await trackAdminAction(
                    "product_add",
                    "product",
                    productName,
                    accessToken
                );
            } catch (err) {
                console.error("Failed to track admin action:", err);
            }
        }
    });

    let redirectPath = ""
    if(isSuccess) {
        toast.success("Product Added Successfully!")
        redirectPath = "/admin/manageProducts"
    }
    // Now It is sent here already but giving this error
    if(error) {
        toast.error('Unable to Add Product');
    }

    return { createProduct, isLoading, redirectPath };
};

//////////////// UPDATE PRODUCT DETAILS FUNCTION ////////////////
export const useUpdateProduct = () => {
    const { getAccessTokenSilently } = useAuth0();

    const location = useLocation(); // Retrieving the path of the current page
    const path = location.pathname

    const parts = path.split("/"); //Filtering the product id from the code
    const id = parts[parts.length - 1]; 

    const updateProductRequest = async (
        productFormData: FormData
    ): Promise<Product> => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/my/shop/update/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: productFormData,
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to update shop: ${errorMessage}`);
        }

        return response.json();
    };

    const {
        mutate: updateShop,
        isLoading,
        error,
        isSuccess,
        data: updatedProduct
    } = useMutation(updateProductRequest, {
        /**
         * SECURITY TRACKING: Log product update to admin activity log
         * Security Benefit: Track all modifications to products for accountability
         */
        onSuccess: async (data) => {
            try {
                const accessToken = await getAccessTokenSilently();
                const productName = data?.productName || "Unknown Product";
                await trackAdminAction(
                    "product_edit",
                    "product",
                    productName,
                    accessToken
                );
            } catch (err) {
                console.error("Failed to track admin action:", err);
            }
        }
    });

    const navigate = useNavigate();
    if (isSuccess) {
        toast.success("Product Updated Successfully");
        navigate("/admin/manageProducts")

    }

    if (error) {
        toast.error("Unable To Update Product");
        console.error("Update product error:", error);
    }

    return {
        updateShop,
        isLoading,

    };
};