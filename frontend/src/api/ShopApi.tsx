       import { SearchState } from "@/pages/SearchPage";
import { Product, ShopSearchResponse } from "@/types";
import { useQuery } from "react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetShop = (shopId?: string) => {
    const getShopByIdRequest = async (): Promise<Product> => {
        const response = await fetch(
            `${API_BASE_URL}/api/shop/${shopId}`
        );

        if (!response.ok) {
            throw new Error("Failed to get shop");
        }

        return response.json();
    };

    const { data: shop, isLoading } = useQuery(
        "fetchShop",
        getShopByIdRequest,
        //only enable this function, when we hv shopId
        {
            enabled: !!shopId,
        }
    );

    return { shop, isLoading };
};

export const useSearchShop = (
    searchState: SearchState,
    color?: string
) => {
    const createSearchRequest = async (): Promise<ShopSearchResponse> => {
        const params = new URLSearchParams();
        params.set("searchQuery", searchState.searchQuery);
        params.set("page", searchState.page.toString());
        params.set("selectedCategory", searchState.selectedCategory.join(","));
        params.set("sortOption", searchState.sortOption);

        const response = await fetch (
            `${API_BASE_URL}/api/shop/search/${color}?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error("Failed to get shop");
        }

        return response.json();
    };

    const { data: results, isLoading } = useQuery(
        ["searchShop", searchState],
        createSearchRequest,
        { enabled: !!color }
    );

    return {
        results,
        isLoading,
    };
};