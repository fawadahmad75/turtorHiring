import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists
  // check if role is student or teacher
  // check if cv and profile image are uploaded
  // upload them to cloudinary
  // create user object and save to database
  // remove password and refresh token from response
  // check for user creation
  // return res

  const { firstName, lastName, email, password, role } = req.body;

  if (
    [firstName, lastName, email, password, role].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  const existedUser = User.findOne({ $or: [{ email }] });

  if (existedUser) {
    throw new ApiError(409, "User with this email already exists.");
  }

  const profileImageLocalPath = req.files?.profileImage[0]?.path;
  const cvLocalPath = req.files?.cv[0]?.path;

  if (!profileImageLocalPath || !cvLocalPath) {
    throw new ApiError(400, "Profile image and CV are required.");
  }

  const profileImage = await uploadToCloudinary(profileImageLocalPath);
  const cv = await uploadToCloudinary(cvLocalPath);

  if (!profileImage || !cv) {
    throw new ApiError(500, "Failed to upload files to Cloudinary.");
  }

  const user = await User.create({
    role,
    email,
    password,
    personalInfo: {
      fullname: {
        firstName,
        lastName,
      },
    },
    educationalInfo: {
      gradeLevel,
      subjectsInterested: [],
      cv: cv.url,
    },
    profileImage: profileImage.url,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user.");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered successfully"));
});

export { registerUser };
