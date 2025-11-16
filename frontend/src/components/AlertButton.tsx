import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import axios from "axios";
import { toast } from "sonner";
import { trackAdminAction } from "@/services/security.service";
import { useAuth0 } from "@auth0/auth0-react";


interface DeleteButtonProps {
    productId: string;
    onDelete: (productId: string) => void;
}

const AlertButton: React.FC<DeleteButtonProps> = ({ productId, onDelete }) => {
  const { getAccessTokenSilently } = useAuth0();

  /**
   * SECURITY TRACKING: Track product deletion in admin activity log
   * Security Benefit: Monitor all product deletions for audit trail
   */
  const handleDelete = async () => {
    try {
        const response = await axios.delete(`http://localhost:7000/api/my/shop/products/${productId}`);
        console.log(response.data);

        // Track admin deletion action
        try {
            const accessToken = await getAccessTokenSilently();
            const productName = response.data?.productName || `Product ID: ${productId}`;
            await trackAdminAction(
                "product_delete",
                "product",
                productName,
                accessToken
            );
        } catch (trackError) {
            console.error("Failed to track admin action:", trackError);
        }

        onDelete(productId);  // Notify the parent component about the deletion
        toast.success("Product Deleted Successfully!")
    } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred while deleting the product');
    }
};

  return (
    <div>
        <AlertDialog>
            <AlertDialogTrigger >
                <Button className="py-5 px-3 bg-[#f23c36] hover:bg-red-500  hover:opacity-80">
                    <Trash2 width={21} />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your product
                    and remove your data from the database.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-[#f23c36]" onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  )
}

export default AlertButton