import mongoose, { type InferSchemaType, type Model } from "mongoose";

const weeklyHighlightSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    weekKey: {
      type: String,
      required: true,
    },
    study: {
      type: String,
      default: "",
    },
    dailyWork: {
      type: String,
      default: "",
    },
    health: {
      type: String,
      default: "",
    },
    imageDataUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

weeklyHighlightSchema.index({ clerkId: 1, weekKey: 1 }, { unique: true });

export type WeeklyHighlightDocument = InferSchemaType<
  typeof weeklyHighlightSchema
> & {
  _id: mongoose.Types.ObjectId;
};

const WeeklyHighlight: Model<WeeklyHighlightDocument> =
  (mongoose.models.WeeklyHighlight as Model<WeeklyHighlightDocument> | undefined) ??
  mongoose.model<WeeklyHighlightDocument>(
    "WeeklyHighlight",
    weeklyHighlightSchema,
  );

export default WeeklyHighlight;
