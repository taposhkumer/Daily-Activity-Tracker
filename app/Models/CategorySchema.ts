import mongoose, { type InferSchemaType, type Model } from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

categorySchema.index({ clerkId: 1, id: 1 }, { unique: true });

export type CategoryDocument = InferSchemaType<typeof categorySchema> & {
  _id: mongoose.Types.ObjectId;
};

const Category: Model<CategoryDocument> =
  (mongoose.models.Category as Model<CategoryDocument> | undefined) ??
  mongoose.model<CategoryDocument>("Category", categorySchema);

export default Category;
