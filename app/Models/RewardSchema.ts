import mongoose, { type InferSchemaType, type Model } from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["daily_bonus", "weekly_bonus", "streak_bonus", "high_completion_bonus"],
    },
    amount: { type: Number, required: true },
    productivity: { type: Number, required: false },
    milestone: { type: String, required: false },
    achievedAt: { type: Date, required: true, default: () => new Date() },
    acknowledged: { type: Boolean, required: true, default: false, index: true },
  },
  { timestamps: true },
);

export type RewardDocument = InferSchemaType<typeof rewardSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Reward: Model<RewardDocument> =
  (mongoose.models.Reward as Model<RewardDocument> | undefined) ??
  mongoose.model<RewardDocument>("Reward", rewardSchema);

export default Reward;
