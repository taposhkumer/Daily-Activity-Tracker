import mongoose, { type InferSchemaType, type Model } from "mongoose";

const taskSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      default: 1,
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
    categoryId: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

taskSchema.index({ clerkId: 1, id: 1 }, { unique: true });

taskSchema.index({ clerkId: 1, date: 1 });

export type TaskDocument = InferSchemaType<typeof taskSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Task: Model<TaskDocument> =
  (mongoose.models.Task as Model<TaskDocument> | undefined) ??
  mongoose.model<TaskDocument>("Task", taskSchema);

export default Task;
