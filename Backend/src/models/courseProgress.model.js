import mongoose from "mongoose";

const courseProgress = new mongoose.Schema({
    courseID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection",
      },
    ],
  });

export const CourseProgress = mongoose.model("CourseProgress", courseProgress);
  