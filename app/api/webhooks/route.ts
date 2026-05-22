import type { WebhookEvent } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import {
  deleteUserByClerkId,
  upsertUserFromWebhook,
} from "@/lib/syncUserToDb";

export async function POST(req: NextRequest) {
  let evt: WebhookEvent;

  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated":
        await upsertUserFromWebhook(evt.data);
        break;
      case "user.deleted":
        if (evt.data.id) {
          await deleteUserByClerkId(evt.data.id);
        }
        break;
      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("Webhook received", { status: 200 });
}
