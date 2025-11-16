import { User } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useGetMyUser = () => {
    const {getAccessTokenSilently} = useAuth0();

    const getMyUserRequest = async (): Promise<User> => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/my/user`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok){
            throw new Error("Failed to fetch user");
        }

        return response.json();
    };

    const { 
        data: currentUser, 
        isLoading, 
        error,
    } = useQuery("fetchCurrentUser", getMyUserRequest);

    if(error) {
        toast.error(error.toString());
    }

    return { currentUser, isLoading};
};

/* describe all the properties that are needed in the body req */
type CreateUserRequest = {
    auth0Id: string;
    email: string;
    isAdmin: boolean;
    recaptchaToken: string;
};

/* hook 1: components use to call the endpoint*/
export const useCreateMyUser = () => {
    const { getAccessTokenSilently } = useAuth0();

    /* fetch request, that accepts 'CreateUserRequest' */
    const createMyUserRequest = async (user: CreateUserRequest) => {
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(`${API_BASE_URL}/api/my/user`,{
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                /* tells backend server, what type of file to expect from the body req */
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });

        /* error message to be displayed if things go unaccordingly  */
        if(!response.ok){
            throw new Error("Failed to create user");
        }
    };

    /* passing 'createMyUserRequest' through useMutation hook to manage things like loading,error and etc*/
    const { 
        mutateAsync: createUser, 
        isLoading, 
        isError, 
        isSuccess,
    } = useMutation(createMyUserRequest);

    return {
        createUser, 
        isLoading,
        isError,
        isSuccess,
    };
};

/* there is no email, as we don't want user to fill in email */
type UpdateMyUserRequest = {
    name: string;
    addressLine1: string;
    city: string;
    country: string;
};

export const useUpdateMyUser = () => {
    const { getAccessTokenSilently } = useAuth0();

    const updateMyUserRequest = async (formData: UpdateMyUserRequest) => {
        /* it will go to the Auth0, and get the accessToken */
        const accessToken = await getAccessTokenSilently();
        // console.log(formData)
        const response = await fetch(`${API_BASE_URL}/api/my/user`,{
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        // console.log(response)
        
        if(!response.ok){
            throw new Error("Failed to update user")
        }
    
        return response.json();

    };

    const { 
        mutateAsync: updateUser, 
        isLoading, 
        isSuccess, 
        error,
        reset, 
    } = useMutation(updateMyUserRequest);

    const navigate = useNavigate();
    const location = useLocation(); // Retrieving the path of the current page
    const path = location.pathname
    const parts = path.split("/"); //Filtering the product id from the code
    const id = parts[parts.length - 1]; 

    if(isSuccess){

        toast.success("User profile updated!");
        if (path.includes(id)){
            navigate(`/products/checkout/${id}`)
        } 
    }

    if(error) {
        toast.error(error.toString());
        //it clears the error state from request, dont want toast to re-appear after rendering
        reset();
    }

    return { updateUser, isLoading};
};