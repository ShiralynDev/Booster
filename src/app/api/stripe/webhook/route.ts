// src/app/api/stripe/webhook/route.ts
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { xpPurchases, stripeProcessedEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-08-27.basil" });

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature")!;
    if (!sig) return new Response("Missing signature", { status: 400 });

    let event: Stripe.Event;
    // console.log("Signature" ,sig)
    const localWebhooksecret="whsec_47b9d0af0535af4511ebc648c2456712f0a74f805816ab4de18f157b06b3c3c6"
    try {
        //TODO: Change to stripe webhook secret !!
        event = stripe.webhooks.constructEvent(payload, sig,  localWebhooksecret);// process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (e) {
        console.error(e)
        return new Response('Invalid signature', { status: 400 });
    }

    const [seen] = await db.select().from(stripeProcessedEvents).where(eq(stripeProcessedEvents.id, event.id));
    if (seen) return new Response("Already processed", { status: 200 });

    try {
        // console.log(event.type)
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;

            const userId = session.client_reference_id;

            // console.log("user", userId)
            //Importante
            if (!userId) throw new Error("Missing client_reference_id");

            // lookup key → XP
            let lookup = session.metadata?.price_lookup_key as string | undefined;
            if (!lookup) {

                //consider removing??
                const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1, expand: ["data.price"] });
                lookup = (items.data[0]?.price as Stripe.Price | undefined)?.lookup_key ?? undefined;
            }
            if (!lookup) throw new Error("No lookup key");

            const xpMap: Record<string, number> = { 
                xp_500: 500, 
                xp_1200: 1200, 
                xp_2500: 2500, 
                xp_5500: 5500, 
                xp_10000:10000, 
                xp_50000:50000 
            };

            //TODO: cambiar errores para cancelar pago?
            const xpBought = xpMap[lookup];
            if (!xpBought) throw new Error("Unknown package");

            const amountCents = typeof session.amount_total === "number" ? session.amount_total : 0;
            const paymentIntentId = String(session.payment_intent ?? "");

            await db
                .update(users)
                .set({ 
                    xp: sql`${users.xp} + ${xpBought}` 
                })
                .where(eq(users.id, userId));

            await db
                .insert(xpPurchases)
                .values({
                    userId,
                    xp: xpBought,
                    amountCents,
                    priceLookupKey: lookup!,
                    paymentIntentId,
                 });

            await db
                .insert(stripeProcessedEvents)
                .values({ 
                    id: event.id
                 });

        }

        return new Response("OK", { status: 200 });
    } catch (e) {
        console.error("Webhook error:", e);
        return new Response("Webhook handler error", { status: 500 });
    }
}
