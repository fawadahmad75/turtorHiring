import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["student", "teacher", "admin"],
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    personalInfo: {
      fullname: {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
      },
      phone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/,
      },
      dateOfBirth: { type: Date },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: "Other",
      },
      profileImage: { type: String, default: "default-profile.png" },
    },
    educationalInfo: {
      gradeLevel: {
        type: String,
        required: function () {
          return this.role === "student" || this.role === "teacher";
        },
      },
      subjectsInterested: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: function () {
            return this.role === "student";
          },
        },
      ],
      subjectsTeaching: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: function () {
            return this.role === "teacher";
          },
        },
      ],
      cv: {
        type: String,
        required: function () {
          return this.role === "teacher";
        },
        match: /^https?:\/\/.+$/,
      },
    },
    status: {
      accountStatus: {
        type: String,
        enum: ["active", "suspended", "inactive"],
        default: "active",
      },
      isTeacherVerified: { type: Boolean, default: false },
    },
    paymentInfo: {
      isPaid: { type: Boolean, default: false },
      paidSubjects: [
        {
          subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
          paymentDate: { type: Date },
        },
      ],
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.index({
  "personalInfo.fullname.firstName": 1,
  "personalInfo.fullname.lastName": 1,
  email: 1,
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    console.error("Error hashing password:", err);
    next(err);
  }
});

// Add a method to verify passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullname: this.personalInfo.fullname, // Fix: Correct the full name reference
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
  return token; // Fix: Return the generated access token
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
  return token; // Fix: Return the generated refresh token
};

// Export the model
export default mongoose.model("User", userSchema);
