import { useCreateProduct, useGetProduct, useUpdateProduct } from "@/api/ProductsApi";
import AddProductsForm from "@/forms/manage-shop-form/AddProductsForm";
import { useLocation } from "react-router-dom";

const ManageShopPage = () => {
    const { createProduct, isLoading: isCreateLoading, redirectPath } = useCreateProduct();
    const { product } = useGetProduct();
    const {  updateShop, isLoading: isUpdateLoading } = useUpdateProduct();

    const location = useLocation();
    const path = location.pathname

    

    return  (
        <AddProductsForm 
          product={product} 
          onSave={path == "/admin/addProducts" ? createProduct : updateShop} 
          isLoading={isCreateLoading || isUpdateLoading }
          redirectPath={redirectPath}
        />
    );
};

export default ManageShopPage;