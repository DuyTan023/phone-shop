///api/webhooks/clerk/route.ts

import { headers } from "next/headers";
import { Webhook } from "svix";

import { userService } from "@/lib/services/users/users.service";

type ClerkWebhookEvent = {
  type: "user.created" | "user.updated" | "user.deleted";

  data: {
    id: string;

    email_addresses: {
      id: string;
      email_address: string;
    }[];

    primary_email_address_id: string | null;

    first_name: string | null;
    last_name: string | null;

    image_url: string;

    phone_numbers: {
      id: string;
      phone_number: string;
    }[];

    primary_phone_number_id: string | null;
  };
};

export async function POST(req: Request) {
  try {
    // ========================================
    // 1. Lấy raw body
    // ========================================

    const payload = await req.text();

    // ========================================
    // 2. Lấy Svix headers
    // ========================================

    const headerPayload = await headers();

    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing Svix headers", {
        status: 400,
      });
    }

    // ========================================
    // 3. Lấy Webhook Secret
    // ========================================

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not configured");

      return new Response("Webhook secret is not configured", {
        status: 500,
      });
    }

    // ========================================
    // 4. Verify Webhook
    // ========================================

    const wh = new Webhook(webhookSecret);

    const event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;

    // ========================================
    // 5. Lấy event type
    // ========================================

    const { type, data } = event;

    // ========================================
    // 6. Xử lý event
    // ========================================

    switch (type) {
      // ======================================
      // USER CREATED
      // ======================================

      case "user.created": {
        const primaryEmail = data.email_addresses.find(
          (item) => item.id === data.primary_email_address_id,
        );

        const email =
          primaryEmail?.email_address ?? data.email_addresses[0]?.email_address;

        if (!email) {
          return new Response("User email not found", {
            status: 400,
          });
        }

        const primaryPhone = data.phone_numbers.find(
          (item) => item.id === data.primary_phone_number_id,
        );

        const fullName =
          [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

        try {
          await userService.createUser({
            clerk_id: data.id,
            email,
            full_name: fullName ?? undefined,
            phone: primaryPhone?.phone_number,
            avatar_url: data.image_url || undefined,
          });
        } catch (err) {
          if (err instanceof Error && err.message === "USER_EXISTS") {
            // Webhook được gửi lại nhưng user đã tồn tại
            break;
          }

          throw err;
        }

        break;
      }

      // ======================================
      // USER UPDATED
      // ======================================

      case "user.updated": {
        const user = await userService.getUserByClerkId(data.id);

        const primaryPhone = data.phone_numbers.find(
          (item) => item.id === data.primary_phone_number_id,
        );

        const fullName =
          [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

        await userService.updateUser(user.id, {
          full_name: fullName ?? undefined,
          phone: primaryPhone?.phone_number,
          avatar_url: data.image_url || undefined,
        });

        break;
      }

      // ======================================
      // USER DELETED
      // ======================================

      case "user.deleted": {
        const user = await userService.getUserByClerkId(data.id);

        await userService.deleteUser(user.id);

        break;
      }

      // ======================================
      // EVENT KHÁC
      // ======================================

      default:
        break;
    }

    // ========================================
    // 7. Trả response thành công
    // ========================================

    return new Response("Webhook processed", {
      status: 200,
    });
  } catch (err) {
    console.error("Clerk webhook error:", err);

    return new Response("Webhook error", {
      status: 500,
    });
  }
}
