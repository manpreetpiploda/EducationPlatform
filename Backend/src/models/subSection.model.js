import mongoose from "mongoose";

const SubSectionSchema = new mongoose.Schema({
	title: { type: String },
	timeDuration: { type: String },
	description: { type: String },
	videoUrl: { type: String },
});

export const SubSection = mongoose.model("SubSection", SubSectionSchema);