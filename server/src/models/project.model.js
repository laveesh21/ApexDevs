import { mongoose, Schema } from "mongoose";

const projectSchema = new Schema({
  title: { type: String, required: true },
  developer: { type: Schema.Types.ObjectId, ref: 'User' },
  about: { type: String },
  imageList: { type: [String] },
  tags: { type: [String] },
  techStack: { type: [String] },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['In-Development', 'Active', 'Deprecated'],
    default: 'In-Development'
  },
  thumbnail: { type: String, default: "" },
  description: { type: String, default: "" },
  // comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);

export default Project;
