"use client"

import React, { useEffect, useState, Suspense } from "react";
import UploadLayout from "../layouts/UploadLayout";
import { BiLoaderCircle } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/user";
import { UploadError, Product } from "../types"; // Keep Product type for potential future use if needed elsewhere
import useCreatePost from "../hooks/useCreatePost";
// Removed TagProductsSection import
// Removed useCreateProduct import (now used internally by useCreatePost)

// Import the components
import EditVideoSection from "../components/upload/EditVideoSection";
import VideoUploadPreview from "../components/upload/VideoUploadPreview";
import AddProductForm from "../components/upload/AddProductForm";
import PagePreloader from "../components/loaders/PagePreloader";

// Define structure for optional new product details (matching the one in useCreatePost)
interface NewProductDetails {
    name: string;
    price: number;
    url: string;
    imageFile: File;
}

export default function Upload() {
    const contextUser = useUser();
    const router = useRouter();

    // Page loading state
    const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

    // Video & Post State
    let [fileDisplay, setFileDisplay] = useState<string>('');
    let [caption, setCaption] = useState<string>('');
    let [file, setFile] = useState<File | null>(null);
    let [validationError, setValidationError] = useState<UploadError | null>(null); // Renamed for clarity, for local validation
    // let [isUploading, setIsUploading] = useState<boolean>(false); // Replaced by hook state
    // Removed taggedProducts state

    // New Product Input State (managed here, passed to AddProductForm)
    let [newProductName, setNewProductName] = useState<string>('');
    let [newProductPrice, setNewProductPrice] = useState<string>('');
    let [newProductUrl, setNewProductUrl] = useState<string>('');
    let [newProductImageFile, setNewProductImageFile] = useState<File | null>(null);
    let [newProductImageDisplay, setNewProductImageDisplay] = useState<string>('');
    // Removed productSaveSuccess state
    // Removed useCreateProduct hook call

    // Instantiate the useCreatePost hook
    const {
        createPostWithProduct,
        isLoading: isUploading, // Use isLoading from the hook
        error: postSubmitError, // Use error from the hook
        isSuccess: postSubmitSuccess // Use isSuccess from the hook (optional)
    } = useCreatePost();


    useEffect(() => {
        if (!contextUser?.user && !contextUser?.isLoadingUser) {
            router.push('/');
        }

        // Set page as loaded after a short delay for smoother transition
        const timer = setTimeout(() => {
            setIsPageLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [contextUser, router]);

    // --- Handlers ---

    const onVideoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const fileUrl = URL.createObjectURL(file);
            setFileDisplay(fileUrl);
            setFile(file);
        }
    };

    const onProductImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const fileUrl = URL.createObjectURL(file);
            setNewProductImageDisplay(fileUrl);
            setNewProductImageFile(file);
        }
    };

    const discard = () => {
        setFileDisplay('');
        setFile(null);
        setCaption('');
        // Removed setTaggedProducts
        // Clear product fields
        setNewProductName('');
        setNewProductPrice('');
        setNewProductUrl('');
        setNewProductImageFile(null);
        setNewProductImageDisplay('');
        // Removed setProductSaveSuccess
                setValidationError(null); // Correct setter name
    };

    const clearVideo = () => {
        setFileDisplay('');
        setFile(null);
    };


    const validateForm = () => { // Renamed for clarity
        setValidationError(null); // Use validationError state
        let isError = false;
                if (!file) {
                        setValidationError({ type: 'File', message: 'A video is required' });
            isError = true;
                } else if (!caption) {
                        setValidationError({ type: 'caption', message: 'A caption is required' });
            isError = true;
        }
        // No need to validate product fields here, useCreatePost handles optional product
        return isError;
    };

    // Removed handleSaveProduct function

    const createNewPost = async () => {
        let isFormValid = !validateForm(); // Use renamed validation function
            if (!isFormValid) return;
            if (!file || !contextUser?.user) return; // Should be caught by validateForm, but double-check

            // setIsUploading(true); // Handled by the hook now
            // Error state is managed by the hook, no need to clear here

        let productDetails: NewProductDetails | undefined = undefined;

        // Check if user intends to add a product (all required fields filled)
        if (newProductName && newProductPrice && newProductUrl && newProductImageFile) {
            const priceNumber = parseFloat(newProductPrice);
            if (isNaN(priceNumber) || priceNumber <= 0) {
                 alert("Please enter a valid positive price for the product.");
                 // setIsUploading(false); // Remove - Handled by hook
                 return;
            }
            productDetails = {
                name: newProductName,
                price: priceNumber,
                url: newProductUrl,
                imageFile: newProductImageFile,
            };
        } else if (newProductName || newProductPrice || newProductUrl || newProductImageFile) {
            // If some but not all product fields are filled, warn the user
            alert("To link a product, please fill in all product details (Name, Price, URL, Image). Otherwise, leave them blank.");
            // setIsUploading(false); // Remove - Handled by hook
            return;
        }


        try {
                        // Call the function returned by the hook
                        await createPostWithProduct(file, contextUser.user.id, caption, productDetails);
            router.push(`/profile/${contextUser.user.id}`);
            // No need to setIsUploading(false) here as we are navigating away
        } catch (err: any) {
                        console.error("Error creating post (or associated product):", err);
                        // setIsUploading(false); // Handled by the hook
                        // Error state is set by the hook, no need to set it here
                        // setError({ type: 'Submit', message: `Failed to create post: ${err.message || 'Unknown error'}` });
            // alert(`Error creating post: ${err}`); // Alert might be annoying, using setError instead
        }
    };

    // --- Render ---

    // Show preloader while page is loading
    if (isPageLoading) {
        return (
            <UploadLayout>
                <PagePreloader type="upload" />
            </UploadLayout>
        );
    }

    return (
        <>
            <UploadLayout>
                <div className="w-full mt-[80px] mb-[40px] bg-white dark:bg-gray-900 shadow-lg rounded-md py-6 md:px-10 px-4 dark:border dark:border-gray-800">
                    <div>
                        <h1 className="text-[23px] font-semibold text-black dark:text-white">Upload video</h1>
                        <h2 className="text-gray-400 dark:text-gray-300 mt-1">Post a video to your account</h2>
                    </div>

                    <div className="mt-8 md:flex gap-6">

                        {/* Left Side: Video Upload/Preview */}
                        <VideoUploadPreview
                            fileDisplay={fileDisplay}
                            isUploading={isUploading}
                            file={file}
                            onVideoFileChange={onVideoFileChange}
                            clearVideo={clearVideo}
                        />

                        {/* Right Side: Edit/Caption/Add Product */}
                        <div className="mt-4 mb-6 flex-grow">
                            {/* Edit Section */}
                            <EditVideoSection />

                            {/* Caption Section Container */}
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 dark:border dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="captionInput" className="mb-1 text-[15px] font-semibold text-black dark:text-white">Caption</label>
                                    <div className="text-gray-400 dark:text-gray-300 text-[12px]">{caption.length}/150</div>
                                </div>
                                <input
                                    id="captionInput"
                                    maxLength={150}
                                    type="text"
                                    className="w-full border dark:border-gray-600 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F02C56] focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    value={caption}
                                    onChange={event => setCaption(event.target.value)}
                                    disabled={isUploading} // Disable caption while uploading
                                />
                            </div>

                            {/* Removed Product Tagging Section Container */}

                           {/* Add New Product Form Container */}
                           <AddProductForm
                                newProductName={newProductName}
                                setNewProductName={setNewProductName}
                                newProductPrice={newProductPrice}
                                setNewProductPrice={setNewProductPrice}
                                newProductUrl={newProductUrl}
                                setNewProductUrl={setNewProductUrl}
                                newProductImageDisplay={newProductImageDisplay}
                                onProductImageChange={onProductImageChange}
                                isUploading={isUploading} // Pass uploading state to disable form fields
                                // Removed props related to direct product saving
                           />

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-8 border-t dark:border-t-gray-700 pt-8">
                                <button
                                    disabled={isUploading}
                                    onClick={discard}
                                    className="px-10 py-2.5 border dark:border-gray-600 text-[16px] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm disabled:opacity-50"
                                >
                                    Discard
                                </button>
                                <button
                                    disabled={isUploading} // Only disable based on post upload state
                                    onClick={createNewPost}
                                    className={`px-10 py-2.5 border dark:border-gray-600 text-[16px] text-white bg-[#F02C56] dark:bg-[#d9254a] rounded-sm ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isUploading ? <BiLoaderCircle className="animate-spin inline-block" color="#ffffff" size={25} /> : 'Post'}
                                </button>
                            </div>

                                                        {/* Display Validation Error */}
                                                        {validationError && (
                                                            <div className="text-red-600 mt-4">
                                                                {validationError.message}
                                                            </div>
                                                        )}
                                                        {/* Display Submit Error from Hook */}
                                                        {postSubmitError && (
                                                            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md mt-4">
                                                                <h3 className="font-bold mb-2">Error:</h3>
                                                                <p>{postSubmitError}</p>
                                                                {postSubmitError.includes('permission') && (
                                                                    <div className="mt-2">
                                                                        <p className="font-semibold">Possible solution:</p>
                                                                        <ul className="list-disc ml-5 mt-1">
                                                                            <li>Check AppWrite bucket permissions</li>
                                                                            <li>Check AppWrite collection permissions</li>
                                                                            <li>Make sure you're logged in</li>
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {postSubmitError.includes('primary_product_id') && (
                                                                    <div className="mt-2">
                                                                        <p className="font-semibold">Solution:</p>
                                                                        <ul className="list-disc ml-5 mt-1">
                                                                            <li>Add the 'primary_product_id' field to your Post collection schema in AppWrite</li>
                                                                            <li>See the ADD_MISSING_FIELD.md guide for detailed instructions</li>
                                                                        </ul>
                                                                        <p className="mt-2 text-sm">Your post will still be created, but it won't be linked to the product until you update the schema.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                        </div> {/* End Right Side */}

                    </div> {/* End md:flex */}
                </div> {/* End Main Container */}
            </UploadLayout>
        </>
    );
}
