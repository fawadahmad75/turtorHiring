import mongoose from "mongoose";

// Define the Subject schema
const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    gradeLevel: {
      type: String,
      enum: ["Primary", "Middle", "High School", "College", "University"],
    },
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference the User model
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference the User model
      },
    ],
    isActive: {
      type: Boolean,
      default: true, // Flag to indicate if the subject is currently active
    },
  },
  { timestamps: true }
);

// Index for efficient querying
subjectSchema.index({ name: 1, gradeLevel: 1 });

// Export the model
export default mongoose.model("Subject", subjectSchema);
