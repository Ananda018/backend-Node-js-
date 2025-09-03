import { asyncHandler } from "../utils/asyncHandler.js"; // Utility to handle async errors without try-catch
import { ApiError } from "../utils/ApiError.js"; // Custom error handler class
import { User } from "../models/user.model.js"; // User model (MongoDB schema)
import { uploadOnCloudinary } from "../utils/cloudnary.js"; // Function to upload files to Cloudinary
import { ApiResponse } from "../utils/ApiResponse.js"; // Standardized API response format

// Controller function to register a new user
const registerUser = asyncHandler(async (req, res) => {
  // STEP 1: Get user details from frontend request body
  const { username, email, fullName, password } = req.body;

  // STEP 2: Validate - check if any required field is empty
  if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // STEP 3: Check if user already exists (either with same username OR email)
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with same username or email already exists");
  }

  // STEP 4: Extract file paths for avatar and cover image from request (multer stores them in req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path; // Optional chaining prevents errors if file missing
 // const coverImageLocalPath = req.files?.coverImage[0]?.path;
 let coverImageLocalPath
 if(req.files&& Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
  coverImageLocalPath = req.files.coverImage[0].path;
 }

  // STEP 5: Avatar is mandatory → throw error if missing
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // STEP 6: Upload avatar and cover image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // STEP 7: Avatar upload must succeed, else throw error
  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // STEP 8: Create new user object in MongoDB
  const user = await User.create({
    fullName,
    avatar: avatar.url, // Cloudinary returns an object with URL
    coverImage: coverImage?.url || "", // Cover image optional
    email,
    password, // Password will be hashed automatically by mongoose pre-save hook
    username: username.toLowerCase(), // Store username in lowercase for uniqueness
  });

  // STEP 9: Fetch the created user but exclude sensitive fields (password, refreshToken)
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  // STEP 10: If user not created properly, throw server error
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // STEP 11: Return success response with created user data
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );
});

// Export controller function
export { registerUser };
