import type { UserJSON } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";
import connectToDB from "@/lib/connectToDB";
import UserModel from "@/app/Models/UserSchema";

function primaryEmailFromWebhook(data: UserJSON) {
  const match = data.email_addresses?.find(
    (entry) => entry.id === data.primary_email_address_id,
  );
  return (
    match?.email_address ??
    data.email_addresses?.[0]?.email_address ??
    ""
  );
}

function fieldsFromWebhook(data: UserJSON) {
  return {
    clerkId: data.id,
    email: primaryEmailFromWebhook(data),
    firstName: data.first_name ?? "",
    lastName: data.last_name ?? "",
    username: data.username ?? "",
    imageUrl: data.image_url ?? "",
  };
}

function fieldsFromClerkUser(user: User) {
  const primary =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0];

  return {
    clerkId: user.id,
    email: primary?.emailAddress ?? "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    username: user.username ?? "",
    imageUrl: user.imageUrl ?? "",
  };
}

export async function upsertUserFields(
  fields: ReturnType<typeof fieldsFromWebhook>,
) {
  await connectToDB();
  await UserModel.findOneAndUpdate(
    { clerkId: fields.clerkId },
    { $set: fields },
    { upsert: true, new: true },
  );
}

export async function upsertUserFromWebhook(data: UserJSON) {
  await upsertUserFields(fieldsFromWebhook(data));
}

export async function syncCurrentUserToDb() {
  const { auth, clerkClient } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    await upsertUserFields(fieldsFromClerkUser(user));
  } catch (err) {
    console.error("syncCurrentUserToDb failed:", err);
  }
}

export async function deleteUserByClerkId(clerkId: string) {
  await connectToDB();
  await UserModel.findOneAndDelete({ clerkId });
}
