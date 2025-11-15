import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImageUp, Loader2 } from "lucide-react";
import { ChangeEvent, MouseEvent, useState } from "react";
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Define the encrypted image structure
interface EncryptedImage {
  url: string;
  iv: string;
  encrypted: boolean;
  publicId: string;
}

// Define interfaces for the props
interface ProductImageSectionProps {
  addedPhotos: EncryptedImage[];
  setAddedPhotos: React.Dispatch<React.SetStateAction<EncryptedImage[]>>;
}

const ProductImageSection: React.FC<ProductImageSectionProps> = ({addedPhotos, setAddedPhotos}) => {
  const [isUploading, setIsUploading] = useState(false);

  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    event.preventDefault();

    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const data = new FormData();
    
    // Append all files with the key "images" (matching backend route)
    for (let i = 0; i < files.length; i++) {
      data.append('images', files[i]);
    }

    try {
      // Get auth token (adjust based on your auth implementation)
      const token = localStorage.getItem('authToken'); // or however you store your token
      
      // Upload encrypted images to Cloudinary via backend
      const response = await axios.post('http://localhost:7000/api/my/shop/upload-images', data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` // Add if using auth
        },
      });
      
      const encryptedImages: EncryptedImage[] = response.data.images;
      console.log(`✅ Uploaded ${encryptedImages.length} encrypted images`);

      // Add encrypted image objects to state
      setAddedPhotos((prev) => [...prev, ...encryptedImages]);
      toast.success(`Successfully uploaded ${encryptedImages.length} image(s)`);

    } catch (error: any) {
      console.error('Error uploading photos:', error);
      toast.error(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  }

  function deletePhoto(event: any, photo: EncryptedImage) {
    event.preventDefault();
    setAddedPhotos([...addedPhotos.filter(p => p.publicId !== photo.publicId)]);
    toast.success('Image removed');
  }

  function setMainPhoto(event: any, photo: EncryptedImage) {
    event.preventDefault();
    const notMainPhotos = [...addedPhotos.filter(p => p.publicId !== photo.publicId)];
    setAddedPhotos([photo, ...notMainPhotos]);
    toast.success('Main image updated');
  }

  return (
    <div>
      <FormField
        name="productImages"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-xl">Product Images (Encrypted Storage)</FormLabel>
            <FormControl className="h-72 bg-white">
              <label className="flex w-full flex-col text-grey-500 overflow-hidden rounded-md border bg-primary-50 justify-center items-center text-gray-400 cursor-pointer">
                <Input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*"
                  onChange={uploadPhoto}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <>
                    <Loader2 width={77} height={77} className="animate-spin text-violet2" />
                    <h3 className="mb-2 mt-2 text-lg font-semibold">Encrypting & Uploading...</h3>
                    <p className="text-md mb-4">Please wait</p>
                  </>
                ) : (
                  <>
                    <ImageUp width={77} height={77} className="" />
                    <h3 className="mb-2 mt-2 text-lg font-semibold">Upload Encrypted Photos</h3>
                    <p className="text-md mb-4">(SVG, PNG, JPG - Max 5MB each)</p>
                    <div className="bg-black text-md py-2 px-4 hover:bg-violet2 font-semibold font-inter text-white rounded-md">
                      Select from computer
                    </div>
                  </>
                )}
              </label>
            </FormControl>
            <FormDescription>
              Images are encrypted before upload for security 🔐
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className='grid grid-cols-3 md:grid-cols-3 gap-3 mt-4'>
        {addedPhotos.length > 0 && addedPhotos.map((photo) => (
          <div key={photo.publicId} className='h-60 flex relative'>
            {/* Display encrypted image directly from Cloudinary */}
            <img 
              className='rounded-2xl cursor-pointer w-full object-cover border-2 border-gray-300' 
              src={photo.url} 
              alt="Encrypted Product Image"
              loading="lazy"
            />
            
            {/* Delete button */}
            <button 
              onClick={event => deletePhoto(event, photo)} 
              className="absolute bottom-3 right-3 text-white bg-black py-2 px-2 bg-opacity-70 rounded-full hover:bg-black hover:text-violet2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
            
            {/* Set as main photo button */}
            <button 
              onClick={event => setMainPhoto(event, photo)} 
              className="absolute bottom-3 left-3 text-white bg-black py-2 px-2 bg-opacity-70 rounded-full hover:bg-black hover:text-violet2"
            >
              {photo === addedPhotos[0] && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              )}
              {photo !== addedPhotos[0] && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              )}
            </button>
            
            {/* Encrypted badge */}
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              🔐 Encrypted
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductImageSection;