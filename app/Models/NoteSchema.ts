import mongoose, { type InferSchemaType, type Model } from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: false, default: "" },
    period: {
      type: String,
      required: true,
      enum: ["week", "month", "year"],
      index: true,
    },
    imageUrl: {
      type: String,
      required: false,
      default: null,
    },
    createdAt: { type: Date, required: true, default: () => new Date() },
    updatedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true },
);

export type NoteDocument = InferSchemaType<typeof noteSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Note: Model<NoteDocument> =
  (mongoose.models.Note as Model<NoteDocument> | undefined) ??
  mongoose.model<NoteDocument>("Note", noteSchema);

export default Note;
