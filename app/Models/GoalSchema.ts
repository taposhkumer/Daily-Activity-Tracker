import mongoose, { type InferSchemaType, type Model } from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    period: {
      type: String,
      required: true,
      enum: ["week", "month", "year"],
      index: true,
    },
    image: {
      type: String,
      required: false,
      default: null,
    },
    imageUrl: {
      type: String,
      required: false,
      default: null,
    },
    completed: { type: Boolean, required: false, default: false },
    completedAt: { type: Date, required: false },
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true },
);

export type GoalDocument = InferSchemaType<typeof goalSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Goal: Model<GoalDocument> =
  (mongoose.models.Goal as Model<GoalDocument> | undefined) ??
  mongoose.model<GoalDocument>("Goal", goalSchema);

export default Goal;
