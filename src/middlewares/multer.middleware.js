import multer from "multer";
import path from "path";

// File validation function
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Dynamic folder based on file type
    if (file.fieldname === "profileImage") {
      cb(null, "./public/temp/profile-images");
    } else if (file.fieldname === "cv") {
      cb(null, "./public/temp/cvs");
    } else {
      cb(new Error("Invalid field name."));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Multer middleware instance
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2 MB
});

// Example usage:
// For uploading both CVs and profile images, you can use:
// app.post('/upload', upload.fields([{ name: 'profileImage' }, { name: 'cv' }]), handler);
