import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a file to Cloudinary
export const uploadToCloudinary = async (localFilePath, folder) => {
  try {
    if (!localFilePath) throw new Error("Local file path is required.");

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder || "uploads", // Optional folder organization
      resource_type: "auto", // Automatically determine resource type (image, video, etc.)
    });

    // Clean up local temp file
    await fs.unlink(localFilePath);

    // Return Cloudinary upload result
    console.log("File uploaded successfully:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    // Ensure local temp file is deleted on error
    if (localFilePath) {
      await fs
        .unlink(localFilePath)
        .catch((err) => console.error("Error deleting local file:", err));
    }
    console.error("Error uploading file to Cloudinary:", error);
    throw error; // Re-throw the error for upstream handling
  }
};
